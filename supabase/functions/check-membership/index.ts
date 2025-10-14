import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get HubSpot token from environment
    const hubspotToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN')
    if (!hubspotToken) {
      throw new Error('HubSpot token not configured')
    }

    // Search HubSpot for existing contact with correct properties
    const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'email',
                operator: 'EQ',
                value: email.toLowerCase(),
              },
            ],
          },
        ],
        properties: [
          'email',
          'firstname',
          'lastname',
          'membership_status___amaa',
          'zip',                    // ← Correct internal name for Postal Code
          'country',                // ← Correct internal name for Country
          'profession_am_aa'        // ← Correct internal name for Profession - AM&AA
        ],
        limit: 1,
      }),
    })

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text()
      console.error('HubSpot search error:', errorText)
      throw new Error(`HubSpot search failed: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    const contact = searchData.results?.[0]

    if (contact) {
      // Contact found - return all the data
      return new Response(JSON.stringify({
        found: true,
        email: contact.properties.email,
        first_name: contact.properties.firstname,
        last_name: contact.properties.lastname,
        profession: contact.properties.profession_am_aa,  // ← Map to profession
        us_zip_code: contact.properties.zip,                // ← Map to us_zip_code
        country: contact.properties.country,               // ← Map to country
        hubspot_contact_id: contact.id,
        is_member: contact.properties.membership_status___amaa === 'Active',
        membership_level: contact.properties.membership_status___amaa,
        status: contact.properties.membership_status___amaa === 'Active' ? 'member' : 'non_member'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      // Contact not found
      return new Response(JSON.stringify({
        found: false,
        email: email,
        status: 'not_found'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (error) {
    console.error('Error in check-membership:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
