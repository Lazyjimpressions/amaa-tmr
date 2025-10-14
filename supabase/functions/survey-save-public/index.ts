// Public survey save function - no authentication required
// Accepts: { email, hubspot_contact_id?, survey_id, answers }
// Creates survey response with email and HubSpot contact ID
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, json, service } from "../_shared/utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);
  }

  const origin = req.headers.get("origin") || undefined;
  
  try {
    const body = await json(req);
    const { email, hubspot_contact_id, survey_id, answers } = body;

    if (!email || !survey_id) {
      return bad("missing_required_fields", origin, 400);
    }

    const supa = service();

    // Create or update survey response with email and HubSpot contact ID
    const { data: response, error: responseError } = await supa
      .from("survey_responses")
      .upsert({
        email: email.toLowerCase(),
        hubspot_contact_id: hubspot_contact_id || null,
        survey_id: survey_id,
        source: "web"
      }, {
        onConflict: 'email,survey_id'
      })
      .select("id")
      .single();

    if (responseError) {
      console.error('Survey response error:', responseError);
      return bad(responseError.message, origin, 500);
    }

    // Store user profile data in survey_non_deal_responses if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      // Extract user profile data from answers
      const profileData: any = {
        response_id: response.id,
        question_code: 'user_profile',
        response_type: 'user_profile'
      };

      // Map form fields to database columns
      answers.forEach((answer: any) => {
        const fieldName = answer.question_id;
        const value = answer.value_text || answer.value_num || answer.value_options;
        
        switch (fieldName) {
          case 'email':
            profileData.email = value;
            break;
          case 'first_name':
            profileData.first_name = value;
            break;
          case 'last_name':
            profileData.last_name = value;
            break;
          case 'profession':
            profileData.profession = value;
            break;
          case 'us_zip_code':
            profileData.us_zip_code = value;
            break;
          case 'country':
            profileData.country = value;
            break;
        }
      });

      const { error: profileError } = await supa
        .from("survey_non_deal_responses")
        .upsert(profileData, {
          onConflict: 'response_id,question_code'
        });

      if (profileError) {
        console.error('Survey profile data error:', profileError);
        return bad(profileError.message, origin, 500);
      }
    }

    return ok({ 
      ok: true, 
      response_id: response.id, 
      message: "Survey data saved successfully" 
    }, origin);

  } catch (error) {
    console.error('Survey save error:', error);
    return bad('Internal server error', origin, 500);
  }
});
