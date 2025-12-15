# Leo Support Agent Starter

This package seeds a minimal customer-support agent for **Leo Consult** using a RAG-lite retriever and a simple intent classifier.

## Files
- `data/faq_seed.csv` — Q&A knowledge base with tags/locale/last_updated.
- `data/intents_seed.csv` — sample user utterances mapped to intents.
- `train_support_agent.py` — trains retriever + intent classifier; saves artifacts and includes a demo `answer_query` function.
- `requirements.txt` — Python requirements.

## Usage
```bash
pip install -r requirements.txt
python train_support_agent.py
```

Artifacts will be saved to `artifacts/`. To answer a query at runtime, import `answer_query` from `train_support_agent.py` in your app or a notebook.

## Customize
- Update contact info, pricing, and policies directly in `data/faq_seed.csv`.
- Add more example utterances in `data/intents_seed.csv` to improve the intent classifier.
- Adjust `SIM_THRESHOLD` in `train_support_agent.py` for stricter/looser retrieval acceptance.
- Tag rows with metadata in `tags` (e.g., `pricing`, `refunds`, `onboarding`).

**Note:** The SentenceTransformer model will download on first run. Ensure internet access on the machine that trains/runs the agent.
