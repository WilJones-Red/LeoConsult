import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

// Using @xenova/transformers for embedding generation
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query } = await req.json()
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Handle greetings with simple pattern matching
    const greetingPattern = /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i
    if (greetingPattern.test(query.toLowerCase())) {
      return new Response(
        JSON.stringify({
          answer: 'Hello! I am Leo AI assistant. How can I help you today?',
          similarity_score: 1.0,
          predicted_intent: 'greeting'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize the embedding pipeline (uses all-MiniLM-L6-v2)
    const embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )

    // Generate embedding for user query
    const output = await embedder(query, { pooling: 'mean', normalize: true })
    const embedding = Array.from(output.data)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Query database for most similar FAQ using cosine distance
    // Note: <=> is the cosine distance operator in pgvector
    const { data, error } = await supabase.rpc('match_faq_vector', {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1
    })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    // Return the best match or fallback message
    if (data && data.length > 0) {
      return new Response(
        JSON.stringify({
          answer: data[0].answer,
          similarity_score: 1 - data[0].similarity,  // Convert distance to similarity
          predicted_intent: data[0].intent
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          answer: 'I am not sure about that. Could you rephrase your question? I can help with: services, pricing, getting started, data analytics, and consulting.',
          similarity_score: 0.0,
          predicted_intent: 'unknown'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
