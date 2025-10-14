import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { email } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if email exists in HubSpot
    const hubspotResponse = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('HUBSPOT_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              propertyName: 'email',
              operator: 'EQ',
              value: email.toLowerCase()
            }]
          }],
          properties: ['email', 'firstname', 'lastname', 'membership_status___amaa', 'zip', 'country', 'profession_am_aa'],
          limit: 1
        })
      }
    )

    if (!hubspotResponse.ok) {
      throw new Error(`HubSpot API error: ${hubspotResponse.status}`)
    }

    const hubspotData = await hubspotResponse.json()
    const contact = hubspotData.results?.[0]

    if (!contact) {
      // Email not found in HubSpot - return error to trigger magic link flow
      return new Response(
        JSON.stringify({
          exists: false,
          message: 'Email not found in HubSpot - magic link required'
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email exists in HubSpot - create/update Supabase user
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const isMember = contact.properties?.membership_status___amaa === 'Active'
    
    // Check if user already exists in Supabase
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email.toLowerCase())
    
    let supabaseUser
    if (existingUser.user) {
      // User exists - update their record
      supabaseUser = existingUser.user
    } else {
      // Create new Supabase user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true, // Auto-confirm since we verified via HubSpot
        user_metadata: {
          first_name: contact.properties.firstname || '',
          last_name: contact.properties.lastname || '',
          us_zip_code: contact.properties.zip || '',
          country: contact.properties.country || '',
          profession: contact.properties.profession_am_aa || '',
          hubspot_contact_id: contact.id
        }
      })
      
      if (createError) {
        throw new Error(`Failed to create Supabase user: ${createError.message}`)
      }
      
      supabaseUser = newUser.user
    }

    // Create/update member record in our members table
    const { data: memberRecord } = await supabase
      .from('members')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (memberRecord) {
      // Update existing member record
      await supabase
        .from('members')
        .update({
          user_id: supabaseUser.id,
          is_member: isMember,
          membership_level: isMember ? 'Active' : null,
          hubspot_vid: contact.id,
          company: contact.properties.company || null
        })
        .eq('id', memberRecord.id)
    } else {
      // Create new member record
      await supabase
        .from('members')
        .insert({
          user_id: supabaseUser.id,
          email: email.toLowerCase(),
          is_member: isMember,
          membership_level: isMember ? 'Active' : null,
          hubspot_vid: contact.id,
          company: contact.properties.company || null
        })
    }

    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://marketrepstg.wpengine.com'}/survey`
      }
    })

    if (sessionError) {
      throw new Error(`Failed to generate session: ${sessionError.message}`)
    }

    // Extract the access token from the magic link
    const magicLink = new URL(sessionData.properties.action_link)
    const accessToken = magicLink.searchParams.get('access_token')
    const refreshToken = magicLink.searchParams.get('refresh_token')

    return new Response(
      JSON.stringify({
        exists: true,
        isMember,
        user: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          first_name: contact.properties.firstname || '',
          last_name: contact.properties.lastname || '',
          us_zip_code: contact.properties.zip || '',
          country: contact.properties.country || '',
          profession: contact.properties.profession_am_aa || ''
        },
        session: {
          access_token: accessToken,
          refresh_token: refreshToken
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('HubSpot auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
