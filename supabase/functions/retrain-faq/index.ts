import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all FAQs from database
    const { data: faqs, error: fetchError } = await supabase
      .from('faq_chatbot')
      .select('id, question, answer, intent, tags')

    if (fetchError) {
      throw new Error('Failed to fetch FAQs: ' + fetchError.message)
    }

    if (!faqs || faqs.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No FAQs found to retrain' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Initialize the embedding pipeline
    const embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )

    // Generate embeddings for each FAQ
    let updatedCount = 0
    for (const faq of faqs) {
      try {
        // Generate embedding for the question
        const output = await embedder(faq.question, { pooling: 'mean', normalize: true })
        const embedding = Array.from(output.data)

        // Update the FAQ with new embedding
        const { error: updateError } = await supabase
          .from('faq_chatbot')
          .update({ 
            embedding: embedding,
            last_updated: new Date().toISOString()
          })
          .eq('id', faq.id)

        if (updateError) {
          console.error(`Error updating FAQ ${faq.id}:`, updateError)
        } else {
          updatedCount++
        }
      } catch (embeddingError) {
        console.error(`Error generating embedding for FAQ ${faq.id}:`, embeddingError)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully retrained ${updatedCount} of ${faqs.length} FAQs`,
        total: faqs.length,
        updated: updatedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Retrain error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
