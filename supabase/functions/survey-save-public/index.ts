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
        source: "web",
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email,survey_id'
      })
      .select("id")
      .single();

    if (responseError) {
      console.error('Survey response error:', responseError);
      return bad(responseError.message, origin, 500);
    }

    // Store answers if provided
    if (answers && Array.isArray(answers) && answers.length > 0) {
      const answerRows = answers.map((answer: any) => ({
        response_id: response.id,
        question_id: answer.question_id,
        value_text: answer.value_text || null,
        value_num: answer.value_num || null,
        value_options: answer.value_options ? JSON.stringify(answer.value_options) : null,
      }));

      const { error: answersError } = await supa
        .from("survey_answers")
        .insert(answerRows);

      if (answersError) {
        console.error('Survey answers error:', answersError);
        return bad(answersError.message, origin, 500);
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
