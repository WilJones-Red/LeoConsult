-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add columns for intent and embedding
ALTER TABLE faq_chatbot 
ADD COLUMN IF NOT EXISTS intent text,
ADD COLUMN IF NOT EXISTS embedding vector(384);
