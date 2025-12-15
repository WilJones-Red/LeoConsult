-- Drop the existing function first
DROP FUNCTION IF EXISTS match_faq(text);

-- Create the enhanced matching function using text similarity and full-text search
CREATE FUNCTION match_faq(user_query text)
RETURNS TABLE (answer text, similarity_score float, predicted_intent text)
LANGUAGE plpgsql
AS $BODY$
DECLARE
  best_match RECORD;
BEGIN
  -- Handle greetings
  IF lower(user_query) SIMILAR TO '%(hi|hello|hey|good morning|good afternoon|good evening)%' THEN
    RETURN QUERY SELECT 
      'Hello! I am Leo AI assistant. How can I help you today?'::text as answer,
      1.0::float as score,
      'greeting'::text as predicted_intent;
    RETURN;
  END IF;

  -- Find best matching FAQ using similarity metrics
  SELECT 
    f.answer,
    f.intent,
    GREATEST(
      similarity(lower(f.question), lower(user_query)),
      similarity(lower(COALESCE(f.tags, '')), lower(user_query))
    ) as score
  INTO best_match
  FROM faq_chatbot f
  ORDER BY score DESC
  LIMIT 1;

  -- Return best match if score is good enough
  IF best_match.score > 0.2 THEN
    RETURN QUERY SELECT 
      best_match.answer,
      best_match.score,
      COALESCE(best_match.intent, 'general'::text);
    RETURN;
  END IF;

  -- If no good match found, return helpful message
  RETURN QUERY SELECT 
    'I am not sure about that. Could you rephrase your question? I can help with: services, pricing, getting started, data analytics, and consulting.'::text as answer,
    0.0::float as score,
    'unknown'::text as predicted_intent;
END;
$BODY$;
