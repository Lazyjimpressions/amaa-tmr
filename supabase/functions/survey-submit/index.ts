import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, created, service, getUser, json } from "../_shared/utils.ts";

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
    const { survey_id, answers } = body;

    if (!survey_id || !answers) {
      return bad('Missing survey_id or answers');
    }

    const supabase = service(authHeader);

    // Create survey response
    const { data: response, error: responseError } = await supabase
      .from('survey_responses')
      .insert({
        survey_id,
        user_id: user.id,
        submitted_at: new Date().toISOString(),
        source: 'web'
      })
      .select('id')
      .single();

    if (responseError) {
      return bad('Failed to create response: ' + responseError.message, undefined, 500);
    }

    // Insert answers
    const answerInserts = answers.map((answer: any) => ({
      response_id: response.id,
      question_id: answer.question_id,
      user_id: user.id,
      value_text: answer.value_text,
      value_num: answer.value_num,
      value_options: answer.value_options
    }));

    const { error: answersError } = await supabase
      .from('survey_answers')
      .insert(answerInserts);

    if (answersError) {
      return bad('Failed to save answers: ' + answersError.message, undefined, 500);
    }

    return created({
      success: true,
      response_id: response.id,
      submitted_at: new Date().toISOString()
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
