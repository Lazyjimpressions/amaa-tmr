// Post-deploy script to ensure survey-save-public has verify_jwt: false
// This prevents the JWT setting from reverting to true after redeployment
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  try {
    // Get the function ID for survey-save-public
    const functionId = 'df97b1fc-573f-47fb-85a1-e8411fc588e3'; // From our deployment
    
    // Use Supabase Management API to update the function configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/edge/functions/${functionId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey
      },
      body: JSON.stringify({
        verify_jwt: false
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Successfully updated JWT setting:', result);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: "JWT verification set to false for survey-save-public",
        function_id: functionId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      const error = await response.text();
      console.error('Failed to update JWT setting:', error);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Failed to update JWT setting",
        details: error
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error updating JWT setting:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Internal server error",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
