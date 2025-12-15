import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Remove short words
}

function calculateScore(query: string, question: string, answer: string): number {
  const queryTokens = new Set(tokenize(query))
  const questionTokens = tokenize(question)
  const answerTokens = tokenize(answer)
  
  // Count matches in question (weighted higher)
  const questionMatches = questionTokens.filter(token => queryTokens.has(token)).length
  // Count matches in answer (weighted lower)
  const answerMatches = answerTokens.filter(token => queryTokens.has(token)).length
  
  // Calculate score: question matches worth more
  const score = (questionMatches * 3) + (answerMatches * 1)
  
  // Normalize by query length
  return score / queryTokens.size
}


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  try {
    const { query } = await req.json()

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Handle greetings
    const greetingPattern = /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i
    if (greetingPattern.test(query.toLowerCase())) {
      return new Response(
        JSON.stringify({
          answer: 'Hello! I am Leo AI assistant. How can I help you today?',
          similarity_score: 1.0,
          predicted_intent: 'greeting',
          matched_question: null,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get all FAQs for keyword matching
    const { data: faqs, error } = await supabase
      .from('faq_chatbot')
      .select('id, question, answer, intent')

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({
          answer: 'Sorry, something went wrong. Please try again later.',
          similarity_score: 0,
          predicted_intent: 'error',
          matched_question: null,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      )
    }

    // Find best match using keyword scoring
    let bestMatch = null
    let bestScore = 0

    for (const faq of faqs || []) {
      const score = calculateScore(query, faq.question, faq.answer)
      if (score > bestScore) {
        bestScore = score
        bestMatch = faq
      }
    }

    let responseData
    // Threshold for accepting a match
    if (bestMatch && bestScore > 0.5) {
      responseData = {
        answer: bestMatch.answer,
        similarity_score: bestScore,
        predicted_intent: bestMatch.intent,
        matched_question: bestMatch.question,
      }
    } else {
      responseData = {
        answer: 'I am not sure about that. Could you rephrase your question? I can help with: services, pricing, getting started, data analytics, and consulting.',
        similarity_score: 0,
        predicted_intent: 'unknown',
        matched_question: null,
      }
    }

    // Log interaction
    const { error: logError } = await supabase.from('chat_logs').insert({
      user_query: query,
      matched_question: responseData.matched_question,
      bot_response: responseData.answer,
      confidence_score: responseData.similarity_score,
      predicted_intent: responseData.predicted_intent,
    })

    if (logError) {
      console.error('Failed to log chat:', logError)
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (err) {
    console.error('Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})
