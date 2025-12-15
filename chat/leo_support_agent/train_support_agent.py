import os, json, time
import pandas as pd
import numpy as np
from pathlib import Path
from joblib import dump, load

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, f1_score
from sklearn.neighbors import NearestNeighbors

from sentence_transformers import SentenceTransformer

DATA_DIR = Path("data")
ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FAQ_CSV = DATA_DIR / "faq_seed.csv"          # columns: question,answer,tags,locale,last_updated
INTENTS_CSV = DATA_DIR / "intents_seed.csv"  # optional: text,intent

EMB_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 5
SIM_THRESHOLD = 0.55  # tweak after evaluation

def load_faq():
    df = pd.read_csv(FAQ_CSV)
    for col in ["question","answer"]:
        if col not in df.columns:
            raise ValueError(f"faq_seed.csv missing required column: {col}")
    # Optional columns
    for col in ["tags","locale","last_updated"]:
        if col not in df.columns:
            df[col] = ""
    # Clean
    df["question"] = df["question"].fillna("").astype(str).str.strip()
    df["answer"] = df["answer"].fillna("").astype(str).str.strip()
    df["tags"] = df["tags"].fillna("").astype(str)
    df["locale"] = df["locale"].fillna("").astype(str).replace({"": "US"})
    df["last_updated"] = df["last_updated"].fillna("").astype(str)
    df = df[(df["question"]!="") & (df["answer"]!="")]
    return df.reset_index(drop=True)

def build_retriever(faq_df):
    model = SentenceTransformer(EMB_MODEL_NAME)
    q_embs = model.encode(faq_df["question"].tolist(), convert_to_numpy=True, normalize_embeddings=True)
    nn = NearestNeighbors(n_neighbors=min(TOP_K, len(q_embs)), metric="cosine")
    nn.fit(q_embs)
    return {"sbert": model, "nn": nn, "embs": q_embs}

def retrieve(query, retriever, faq_df, locale=None):
    qv = retriever["sbert"].encode([query], convert_to_numpy=True, normalize_embeddings=True)
    distances, indices = retriever["nn"].kneighbors(qv, return_distance=True)
    sims = 1.0 - distances[0]  # cosine similarity
    items = []
    for sim, idx in zip(sims, indices[0]):
        row = faq_df.iloc[int(idx)]
        if (locale is None) or (row["locale"] == locale):
            items.append({
                "similarity": float(sim),
                "question": row["question"],
                "answer": row["answer"],
                "tags": row["tags"],
                "locale": row["locale"],
                "last_updated": row["last_updated"]
            })
    return items

def train_intent_classifier(faq_df, intents_csv=INTENTS_CSV):
    # Use intents_seed.csv if provided; otherwise weakly supervise from tags
    if intents_csv.exists():
        intents = pd.read_csv(intents_csv)
        if not {"text","intent"}.issubset(intents.columns):
            raise ValueError("intents_seed.csv must have columns: text,intent")
        X = intents["text"].astype(str).tolist()
        y = intents["intent"].astype(str).tolist()
    else:
        # Weak supervision: expand rows by tags (comma-separated)
        rows = []
        for _, r in faq_df.iterrows():
            tags = [t.strip() for t in str(r["tags"]).split(",") if t.strip()]
            if not tags:
                continue
            for t in tags:
                rows.append({"text": r["question"], "intent": t})
        if not rows:
            rows = [{"text": q, "intent": "general"} for q in faq_df["question"].tolist()]
        intents = pd.DataFrame(rows)
        X = intents["text"].tolist()
        y = intents["intent"].tolist()

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=1)),
        ("clf", LogisticRegression(max_iter=200))
    ])
    if len(set(y)) >= 2 and len(X) >= 20:
        Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y if len(set(y))>1 else None)
        pipe.fit(Xtr, ytr)
        preds = pipe.predict(Xte)
        print(classification_report(yte, preds))
        try:
            print("Macro F1:", f1_score(yte, preds, average="macro"))
        except Exception:
            pass
    else:
        pipe.fit(X, y)
    return pipe

def save_artifacts(retriever, faq_df, intent_clf):
    dump({"embs": retriever["embs"]}, ARTIFACTS_DIR / "retriever_embs.joblib")
    meta = {
        "emb_model": EMB_MODEL_NAME,
        "top_k": TOP_K,
        "sim_threshold": SIM_THRESHOLD,
        "saved_at": time.time()
    }
    json.dump(meta, open(ARTIFACTS_DIR / "retriever_meta.json", "w"))
    faq_df.to_csv(ARTIFACTS_DIR / "faq_corpus.csv", index=False)
    dump(intent_clf, ARTIFACTS_DIR / "intent_clf.joblib")

def load_runtime():
    faq_df = pd.read_csv(ARTIFACTS_DIR / "faq_corpus.csv")
    meta = json.load(open(ARTIFACTS_DIR / "retriever_meta.json"))
    model = SentenceTransformer(meta["emb_model"])
    from sklearn.neighbors import NearestNeighbors
    embs = load(ARTIFACTS_DIR / "retriever_embs.joblib")["embs"]
    nn = NearestNeighbors(n_neighbors=min(meta["top_k"], len(embs)), metric="cosine")
    nn.fit(embs)
    intent_clf = load(ARTIFACTS_DIR / "intent_clf.joblib")
    return faq_df, {"sbert": model, "nn": nn, "embs": embs}, intent_clf, meta

def answer_query(query, locale="US"):
    faq_df, retriever, intent_clf, meta = load_runtime()
    try:
        intent = intent_clf.predict([query])[0]
    except Exception:
        intent = "general"

    hits = retrieve(query, retriever, faq_df, locale=locale)
    best = hits[0] if hits else None

    if (not best) or (best["similarity"] < meta["sim_threshold"]):
        return {
            "answer": "I’m not fully confident about the answer. I’ll escalate this to a human specialist.",
            "intent": intent,
            "confidence": float(best["similarity"]) if best else 0.0,
            "citations": hits
        }
    citation_note = f"(Source: '{best['question']}' • last updated {best['last_updated'] or 'N/A'})"
    return {
        "answer": f"{best['answer']}\n\n{citation_note}",
        "intent": intent,
        "confidence": float(best["similarity"]),
        "citations": hits
    }

def main():
    print("Loading FAQ…")
    faq_df = load_faq()
    print(f"FAQ rows: {len(faq_df)}")

    print("Building retriever…")
    retriever = build_retriever(faq_df)

    print("Training intent classifier…")
    intent_clf = train_intent_classifier(faq_df)

    print("Saving artifacts…")
    save_artifacts(retriever, faq_df, intent_clf)

    # quick smoke test
    demo_q = faq_df.iloc[0]["question"]
    print("\nSmoke test query:", demo_q)
    resp = answer_query(demo_q)
    import json as _json
    print("Response:", _json.dumps(resp, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    os.makedirs(DATA_DIR, exist_ok=True)
    if not FAQ_CSV.exists():
        pd.DataFrame([
            {
                "question": "What services do you offer?",
                "answer": "We provide data analytics consulting, predictive modeling, and dashboarding. Book a consult at example.com/call.",
                "tags": "services,onboarding",
                "locale": "US",
                "last_updated": "2025-08"
            },
            {
                "question": "How do I start a project?",
                "answer": "Schedule a discovery call; we’ll scope goals and data access, then deliver a brief proposal within 2 business days.",
                "tags": "onboarding,process",
                "locale": "US",
                "last_updated": "2025-08"
            }
        ]).to_csv(FAQ_CSV, index=False)
        print(f"Scaffolded {FAQ_CSV}. Replace with your real FAQ after answering the setup questions.")

    main()
