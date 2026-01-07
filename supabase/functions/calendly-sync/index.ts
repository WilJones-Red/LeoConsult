// Calendly API Polling - Sync Scheduled Events to Leads
// This runs every 15 minutes to check for new Calendly bookings

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CALENDLY_TOKEN = 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzY3Nzk0NTc3LCJqdGkiOiJlMzBlNWVjOC01MjdhLTQxOGYtYWRmYi1jMzhlZjVkMTlmNjQiLCJ1c2VyX3V1aWQiOiIwNzYxOWFmNC1jYWFkLTQ1ZjYtYWU0Yy0yOTZhYjNmMWY4OWMifQ.jP8albDew4-tfo6PWVqpGgUL6AzD0_OzpqtN3cUyEv6lB6oPPVSt8__jPknB2zTiYMgPWgqIRdPzTpn-I2jAiw'
const CALENDLY_USER_URI = 'https://api.calendly.com/users/07619af4-caad-45f6-ae4c-296ab3f1f89c'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting Calendly sync...')

    // Initialize Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get scheduled events from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const eventsResponse = await fetch(
      `https://api.calendly.com/scheduled_events?user=${CALENDLY_USER_URI}&min_start_time=${sevenDaysAgo.toISOString()}&count=100`,
      {
        headers: {
          'Authorization': `Bearer ${CALENDLY_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!eventsResponse.ok) {
      throw new Error(`Calendly API error: ${eventsResponse.statusText}`)
    }

    const eventsData = await eventsResponse.json()
    const events = eventsData.collection || []
    
    console.log(`Found ${events.length} scheduled events`)

    let updatedCount = 0

    // Process each event
    for (const event of events) {
      try {
        // Get invitee details for this event
        const inviteesResponse = await fetch(
          event.uri + '/invitees',
          {
            headers: {
              'Authorization': `Bearer ${CALENDLY_TOKEN}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!inviteesResponse.ok) continue

        const inviteesData = await inviteesResponse.json()
        const invitees = inviteesData.collection || []

        // Update each invitee in our leads table
        for (const invitee of invitees) {
          const email = invitee.email
          const name = invitee.name
          const timezone = invitee.timezone

          // Extract phone and company from questions
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

          // Update lead in Supabase
          const { data, error } = await supabase
            .from('leads')
            .update({
              full_name: name,
              phone: phone,
              company_name: company,
              calendly_booked: true,
              status: 'Call Scheduled',
              metadata: {
                calendly_event_uri: event.uri,
                calendly_invitee_uri: invitee.uri,
                timezone: timezone,
                start_time: event.start_time,
                end_time: event.end_time,
                synced_at: new Date().toISOString()
              }
            })
            .eq('email', email)
            .select()

          if (!error && data && data.length > 0) {
            updatedCount++
            console.log(`Updated lead: ${email}`)
          } else if (error) {
            console.error(`Error updating ${email}:`, error)
          }
        }
      } catch (err) {
        console.error('Error processing event:', err)
        continue
      }
    }

    console.log(`Sync complete. Updated ${updatedCount} leads.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        events_processed: events.length,
        leads_updated: updatedCount,
        synced_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Sync error:', error)
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
