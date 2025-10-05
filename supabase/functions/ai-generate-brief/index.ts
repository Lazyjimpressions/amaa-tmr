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
    const { survey_id, filters } = body;

    if (!survey_id) {
      return bad('Missing survey_id');
    }

    const supabase = service(authHeader);

    // For MVP, return a stub AI brief
    const stubBrief = `# AI Insight Brief

**⚠️ AI-Generated Content**

## Market Overview
Based on the survey data, the market shows strong activity with increasing deal volumes and diverse industry participation.

## Key Insights
- Deal activity has increased 15% year-over-year
- Technology sector leads with 35% of transactions
- Average deal size trending upward
- Geographic distribution shows concentration in major metros

## Trends
- Growing interest in AI and automation deals
- Healthcare sector showing resilience
- Manufacturing deals focusing on digital transformation

*This is a stub brief for MVP. Real AI analysis will be implemented in Phase 2.*`;

    // Save brief to database
    const { data: brief, error: briefError } = await supabase
      .from('ai_briefs')
      .insert({
        user_id: user.id,
        member_email: user.email,
        survey_id,
        filters: filters || {},
        brief_md: stubBrief
      })
      .select('id, brief_md, created_at')
      .single();

    if (briefError) {
      return bad('Failed to save brief: ' + briefError.message, undefined, 500);
    }

    return ok({
      success: true,
      brief_id: brief.id,
      brief_md: brief.brief_md,
      created_at: brief.created_at,
      note: 'Stub brief for MVP - real AI analysis coming in Phase 2'
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
