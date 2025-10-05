import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, service, getUser, json } from "../_shared/utils.ts";

Deno.serve(async (req: Request) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return bad('Missing authorization header', undefined, 401);
    }

    const user = await getUser(authHeader);
    if (!user) {
      return bad('Invalid token', undefined, 401);
    }

    const body = await json(req);
    const { survey_id, answers, draft_id } = body;

    if (!survey_id || !answers) {
      return bad('Missing survey_id or answers');
    }

    const supabase = service(authHeader);
    let responseId;

    if (draft_id) {
      // Update existing draft
      const { data: response, error: responseError } = await supabase
        .from('survey_responses')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', draft_id)
        .eq('user_id', user.id)
        .select('id')
        .single();

      if (responseError) {
        return bad('Failed to update draft: ' + responseError.message, undefined, 500);
      }

      responseId = response.id;
    } else {
      // Create new draft
      const { data: response, error: responseError } = await supabase
        .from('survey_responses')
        .insert({
          survey_id,
          user_id: user.id,
          source: 'web'
        })
        .select('id')
        .single();

      if (responseError) {
        return bad('Failed to create draft: ' + responseError.message, undefined, 500);
      }

      responseId = response.id;
    }

    // Upsert answers
    const answerInserts = answers.map((answer: any) => ({
      response_id: responseId,
      question_id: answer.question_id,
      user_id: user.id,
      value_text: answer.value_text,
      value_num: answer.value_num,
      value_options: answer.value_options
    }));

    const { error: answersError } = await supabase
      .from('survey_answers')
      .upsert(answerInserts, {
        onConflict: 'response_id,question_id'
      });

    if (answersError) {
      return bad('Failed to save draft answers: ' + answersError.message, undefined, 500);
    }

    return ok({
      success: true,
      draft_id: responseId,
      saved_at: new Date().toISOString()
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
