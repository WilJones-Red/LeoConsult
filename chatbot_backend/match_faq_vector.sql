-- PostgreSQL function to find similar FAQs using vector embeddings
-- This function is called by the Edge Function

CREATE OR REPLACE FUNCTION match_faq_vector(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 1
)
RETURNS TABLE (
  answer text,
  similarity float,
  intent text,
  question text
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    faq_chatbot.answer,
    1 - (faq_chatbot.embedding <=> query_embedding) as similarity,
    COALESCE(faq_chatbot.intent, 'general') as intent,
    faq_chatbot.question
  FROM faq_chatbot
  WHERE 1 - (faq_chatbot.embedding <=> query_embedding) > match_threshold
  ORDER BY faq_chatbot.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
