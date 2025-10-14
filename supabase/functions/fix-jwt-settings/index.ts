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
    // This function just returns a success message
    // The JWT settings need to be changed manually in the Supabase dashboard
    return new Response(JSON.stringify({
      message: 'JWT settings need to be manually updated in Supabase dashboard',
      instructions: [
        '1. Go to Supabase Dashboard > Edge Functions',
        '2. Find the check-membership function',
        '3. Click on the function settings',
        '4. Turn OFF "Verify JWT"',
        '5. Save the settings'
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in fix-jwt-settings:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})