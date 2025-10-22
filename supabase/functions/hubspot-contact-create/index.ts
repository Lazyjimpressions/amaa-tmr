import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { cors, getUser } from "../_shared/utils.ts"

serve(async (req) => {
  const origin = req.headers.get('origin') || undefined;
  const corsHeaders = cors(origin);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Require authentication
    const authHeader = req.headers.get('authorization') || undefined;
    const user = await getUser(authHeader);
    if (!user?.email) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { first_name, last_name, profession, us_zip_code, country } = await req.json()

    const hubspotToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN')
    if (!hubspotToken) {
      throw new Error('HubSpot token not configured')
    }

    // Check if contact exists
    const searchResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: user.email.toLowerCase(),
          }],
        }],
        properties: ['email'],
        limit: 1,
      }),
    })

    const searchData = await searchResponse.json()
    const existingContact = searchData.results?.[0]

    const contactProperties = {
      email: user.email.toLowerCase(),
      firstname: first_name,
      lastname: last_name,
      profession_am_aa: profession,
      zip: us_zip_code || '',
      country: country || '',
      lifecyclestage: 'subscriber',
      hs_analytics_source: 'DIRECT_TRAFFIC'
    }

    let hubspotContactId

    if (existingContact) {
      // Update existing contact
      const updateResponse = await fetch(
        `https://api.hubapi.com/crm/v3/objects/contacts/${existingContact.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties: contactProperties })
        }
      )

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text()
        console.error('HubSpot update error:', errorText)
        throw new Error(`Failed to update HubSpot contact: ${updateResponse.status}`)
      }

      hubspotContactId = existingContact.id
    } else {
      // Create new contact
      const createResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: contactProperties })
      })

      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        console.error('HubSpot create error:', errorText)
        throw new Error(`Failed to create HubSpot contact: ${createResponse.status}`)
      }

      const newContact = await createResponse.json()
      hubspotContactId = newContact.id
    }

    return new Response(JSON.stringify({
      success: true,
      hubspot_contact_id: hubspotContactId,
      action: existingContact ? 'updated' : 'created'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in hubspot-contact-create:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
