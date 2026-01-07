// Calendly Webhook Handler
// This Edge Function receives Calendly webhook events and updates lead records

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, calendly-webhook-signature',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Received Calendly webhook:', payload)

    // Calendly sends event data in 'payload' object
    const event = payload.event
    const eventType = payload.event_type || payload.event

    // Only process invitee.created events (when someone books)
    if (eventType !== 'invitee.created') {
      console.log('Ignoring event type:', eventType)
      return new Response(JSON.stringify({ message: 'Event type not processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Extract invitee data
    const invitee = payload.payload || payload
    const email = invitee.email
    const name = invitee.name
    const timezone = invitee.timezone
    const scheduledEvent = invitee.scheduled_event || {}
    const uri = invitee.uri

    // Parse questions/answers for additional data
    let phone = null
    let company = null
    
    if (invitee.questions_and_answers) {
      for (const qa of invitee.questions_and_answers) {
        const question = qa.question.toLowerCase()
        if (question.includes('phone') || question.includes('mobile')) {
          phone = qa.answer
        }
        if (question.includes('company') || question.includes('organization')) {
          company = qa.answer
        }
      }
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update lead record
    const { data, error } = await supabase
      .from('leads')
      .update({
        full_name: name,
        phone: phone,
        company_name: company,
        calendly_booked: true,
        status: 'Call Scheduled',
        metadata: {
          calendly_uri: uri,
          timezone: timezone,
          scheduled_event: scheduledEvent,
          webhook_received_at: new Date().toISOString()
        }
      })
      .eq('email', email)
      .select()

    if (error) {
      console.error('Error updating lead:', error)
      throw error
    }

    console.log('Successfully updated lead:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead updated successfully',
        updated_lead: data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
