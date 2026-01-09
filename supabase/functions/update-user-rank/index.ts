// supabase/functions/update-user-rank/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Create regular client to verify the requesting user
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
    
    // Get the current user from the auth header
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requesting user is an admin or super_admin
    const requestingUserRank = user.user_metadata?.rank
    if (requestingUserRank !== 'super_admin' && requestingUserRank !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only administrators can manage user ranks' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the email and rank from request body
    const { email, rank } = await req.json()

    if (!email || !rank) {
      return new Response(
        JSON.stringify({ error: 'Email and rank are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const validRanks = ['employee', 'sales', 'staff', 'admin', 'super_admin', null]
    if (!validRanks.includes(rank)) {
      return new Response(
        JSON.stringify({ error: 'Invalid rank. Must be one of: employee, sales, staff, admin, super_admin, or null' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Find the user by email
    const { data: targetUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      return new Response(
        JSON.stringify({ error: 'Failed to list users: ' + listError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = targetUsers.users.find(u => u.email === email)
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found with email: ' + email }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Update the user's metadata
    const newMetadata = { ...targetUser.user_metadata }
    
    if (rank === null) {
      delete newMetadata.rank
    } else {
      newMetadata.rank = rank
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { user_metadata: newMetadata }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to update user: ' + updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully updated ${email} to rank: ${rank || 'none'}`,
        user: {
          email: updatedUser.user.email,
          rank: updatedUser.user.user_metadata?.rank || null
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
