-- Enable required extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop the existing function
DROP FUNCTION IF EXISTS match_faq(text);

-- Create the function
CREATE OR REPLACE FUNCTION match_faq(user_query text)
RETURNS TABLE (answer text, similarity_score float, predicted_intent text)
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Handle greetings
  IF lower(user_query) SIMILAR TO '%(hi|hello|hey|good morning|good afternoon|good evening)%' THEN
    RETURN QUERY SELECT 
      'Hello! I am Leo AI assistant. How can I help you today?'::text,
      1.0::float,
      'greeting'::text;
    RETURN;
  END IF;

  -- Try to find matching FAQ and return result or default
  RETURN QUERY
  WITH matched AS (
    SELECT 
      f.answer,
      GREATEST(
        similarity(lower(f.question), lower(user_query)),
        similarity(lower(COALESCE(f.tags, '')), lower(user_query))
      ) as score,
      COALESCE(f.intent, 'general'::text) as intent
    FROM faq_chatbot f
    WHERE 
      similarity(lower(f.question), lower(user_query)) > 0.1
      OR similarity(lower(COALESCE(f.tags, '')), lower(user_query)) > 0.1
    ORDER BY score DESC
    LIMIT 1
  )
  SELECT * FROM matched
  UNION ALL
  SELECT 
    'I am not sure about that. Could you rephrase your question? I can help with: services, pricing, getting started, data analytics, and consulting.'::text,
    0.0::float,
    'unknown'::text
  WHERE NOT EXISTS (SELECT 1 FROM matched)
  LIMIT 1;
END;
$function$;