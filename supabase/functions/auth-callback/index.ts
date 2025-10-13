import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, getUser, service } from "../_shared/utils.ts";

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
    const { email, hubspot_contact_id, is_member, membership_level } = await req.json()
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supa = service() // service role to bypass RLS

    // Check if user already exists in members table
    const { data: existingMember } = await supa
      .from('members')
      .select('id, user_id, email, is_member')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingMember) {
      // User exists - update membership status if provided
      if (is_member !== undefined) {
        await supa
          .from('members')
          .update({
            is_member,
            membership_level: membership_level || null,
            hubspot_vid: hubspot_contact_id || null
          })
          .eq('id', existingMember.id)
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          action: 'updated',
          member_id: existingMember.id,
          user_id: existingMember.user_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      // New user - create member record
      const { data: newMember, error } = await supa
        .from('members')
        .insert({
          email: email.toLowerCase(),
          is_member: is_member || false,
          membership_level: membership_level || null,
          hubspot_vid: hubspot_contact_id || null
        })
        .select('id, user_id')
        .single()

      if (error) {
        console.error('Error creating member record:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create member record' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          action: 'created',
          member_id: newMember.id,
          user_id: newMember.user_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

  } catch (error) {
    console.error('Auth callback error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process authentication callback' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
