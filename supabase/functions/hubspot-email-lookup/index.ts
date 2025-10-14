import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    if (contact) {
      // Email exists in HubSpot
      const isMember = contact.properties?.membership_status___amaa === 'Active'
      
      return new Response(
        JSON.stringify({
          exists: true,
          isMember,
          contact: {
            email: contact.properties.email,
            first_name: contact.properties.firstname,
            last_name: contact.properties.lastname,
            us_zip_code: contact.properties.zip,
            country: contact.properties.country,
            profession: contact.properties.profession_am_aa,
            membership_status: contact.properties.membership_status___amaa
          }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // Email not found in HubSpot
      return new Response(
        JSON.stringify({
          exists: false,
          isMember: false
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('HubSpot email lookup error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to lookup email' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
