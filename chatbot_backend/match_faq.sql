CREATE OR REPLACE FUNCTION match_faq(user_query text)
RETURNS TABLE (answer text, similarity_score float) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle greetings first
  IF lower(user_query) SIMILAR TO '%(hi|hello|hey|good morning|good afternoon|good evening)%' THEN
    RETURN QUERY SELECT 
      'Hello! I''m Leo''s AI assistant. How can I help you today?'::text as answer,
      1.0::float as score;
    RETURN;
  END IF;

  -- Regular FAQ matching
  RETURN QUERY
  SELECT 
    faq_chatbot.answer,
    similarity(lower(faq_chatbot.question), lower(user_query)) as score
  FROM faq_chatbot
  WHERE similarity(lower(faq_chatbot.question), lower(user_query)) > 0.3
  ORDER BY score DESC
  LIMIT 1;

  -- If no match found
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'I understand you''re asking something, but I''m not quite sure. Could you rephrase your question? I''m here to help with information about our services, pricing, and how to get started.'::text as answer,
      0.0::float as score;
  END IF;
END;
$$;
