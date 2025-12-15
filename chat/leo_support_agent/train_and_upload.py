import os, json
import pandas as pd
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer
from supabase import create_client
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from joblib import dump

# Initialize Supabase client
supabase_url = "https://clpcskkoguomoihnisai.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyNjIxMiwiZXhwIjoyMDcwODAyMjEyfQ.XuwIPzfFdebMIQMn9QGsshkkvKX4yBQzlDG6-KH81K8"
supabase = create_client(supabase_url, supabase_key)

# Paths
SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "data"
ARTIFACTS_DIR = SCRIPT_DIR / "artifacts"
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

FAQ_CSV = DATA_DIR / "faq_seed.csv"
INTENTS_CSV = DATA_DIR / "intents_seed.csv"

def train_and_upload():
    # 1. Train intent classifier
    intents = pd.read_csv(INTENTS_CSV)
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=1)),
        ("clf", LogisticRegression(max_iter=200))
    ])
    pipe.fit(intents["text"], intents["intent"])
    
    # Save the trained model
    dump(pipe, ARTIFACTS_DIR / "intent_classifier.joblib")
    
    # 2. Generate and upload embeddings
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    
    # Get FAQs from Supabase
    response = supabase.table('faq_chatbot').select('*').execute()
    faqs = response.data
    
    # Generate and upload embeddings
    for faq in faqs:
        embedding = model.encode(faq['question'])
        
        # Update FAQ with embedding and save intent
        intent = pipe.predict([faq['question']])[0]
        supabase.table('faq_chatbot')\
                .update({
                    'embedding': embedding.tolist(),
                    'intent': intent
                })\
                .eq('id', faq['id'])\
                .execute()
    
    print("Training complete! Model saved and embeddings uploaded to Supabase.")

if __name__ == "__main__":
    train_and_upload()
