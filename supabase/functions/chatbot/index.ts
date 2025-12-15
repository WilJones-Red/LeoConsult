// supabase/functions/chatbot/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

// Environment variables set in Supabase dashboard
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

function similarity(a: string, b: string): number {
  // Simple similarity: Jaccard index on lowercased word sets
  const setA = new Set(a.toLowerCase().split(/\W+/))
  const setB = new Set(b.toLowerCase().split(/\W+/))
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const union = new Set([...setA, ...setB])
  return union.size === 0 ? 0 : intersection.size / union.size
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ response: "Please provide a message." }), { status: 400 })
  }
  // Fetch all FAQs (for small tables, this is fine)
  const { data, error } = await supabase
    .from('faq_chatbot')
    .select('question,answer')
  if (error || !data) {
    return new Response(JSON.stringify({ response: "Error fetching FAQ data." }), { status: 500 })
  }
  // Find best match
  let bestScore = 0
  let bestAnswer = null
  for (const row of data) {
    const score = similarity(message, row.question)
    if (score > bestScore) {
      bestScore = score
      bestAnswer = row.answer
    }
  }
  let response
  if (bestScore > 0.4) {
    response = bestAnswer
  } else {
    response = "I'm not sure about that. I'll escalate your question to a human specialist."
  }
  return new Response(JSON.stringify({ response }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
