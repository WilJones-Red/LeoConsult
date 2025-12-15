-- Enable pgvector extension for semantic search with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Convert the embedding column from text to vector type
-- all-MiniLM-L6-v2 produces 384-dimensional vectors
ALTER TABLE faq_chatbot 
ALTER COLUMN embedding TYPE vector(384) 
USING embedding::vector(384);

-- Create an index for fast vector similarity search (cosine distance)
CREATE INDEX IF NOT EXISTS faq_embedding_idx 
ON faq_chatbot 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Note: Run this SQL in your Supabase SQL Editor
