import os
from supabase import create_client
from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np

# Initialize Supabase client
supabase_url = "https://clpcskkoguomoihnisai.supabase.co"
supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNscGNza2tvZ3VvbW9paG5pc2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyNjIxMiwiZXhwIjoyMDcwODAyMjEyfQ.XuwIPzfFdebMIQMn9QGsshkkvKX4yBQzlDG6-KH81K8"
supabase = create_client(supabase_url, supabase_key)

# Load and encode FAQs
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Get existing FAQs from Supabase
response = supabase.table('faq_chatbot').select('*').execute()
faqs = response.data

# Generate embeddings for each FAQ
for faq in faqs:
    # Generate embedding for the question
    embedding = model.encode(faq['question'])
    
    # Update the FAQ with its embedding
    supabase.table('faq_chatbot')\
            .update({'embedding': embedding.tolist()})\
            .eq('id', faq['id'])\
            .execute()

print("Embeddings generated and uploaded to Supabase!")
