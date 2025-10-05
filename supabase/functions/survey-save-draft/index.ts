// Accepts: { survey_slug, response_id?, answers: [{code,type,value}] }
// Creates or updates a response with submitted_at = NULL (draft). Overwrites existing answers for that response_id/code set.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, json, service, getUser } from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const authHeader = req.headers.get("authorization") || undefined;
  const user = await getUser(authHeader);
  if (!user) return bad("unauthorized", origin, 401);

  const body = (await json(req)) as { survey_slug?: string; response_id?: string; answers?: any[] };
  const slug = (body.survey_slug || "").trim();
  const answers = Array.isArray(body.answers) ? body.answers : [];
  const respId = (body.response_id || "").trim();

  if (!slug) return bad("missing_survey_slug", origin);

  const supa = service();

  const { data: survey, error: sErr } = await supa
    .from("surveys")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (sErr || !survey) return bad("unknown_survey_slug", origin, 400);

  let response_id = respId;
  if (!response_id) {
    const { data: r, error: rErr } = await supa
      .from("survey_responses")
      .insert({ survey_id: survey.id, user_id: user.id, source: "web" })
      .select("id")
      .single();
    if (rErr) return bad(rErr.message, origin, 500);
    response_id = r.id;
  }

  if (answers.length) {
    // Load or create questions and upsert answers (delete-before-insert for simplicity)
    const codes = [...new Set(answers.map((a) => a.code).filter(Boolean))];
    const { data: qs } = await supa
      .from("survey_questions")
      .select("id, code")
      .eq("survey_id", survey.id)
      .in("code", codes);

    const have = new Map((qs || []).map((q: any) => [q.code, q.id]));
    const missing = codes.filter((c) => !have.has(c));
    if (missing.length) {
      const { data: created, error: cErr } = await supa
        .from("survey_questions")
        .insert(missing.map((code) => ({ survey_id: survey.id, code, text: code, type: "text", version: 1 })))
        .select("id, code");
      if (cErr) return bad(cErr.message, origin, 500);
      for (const q of created || []) have.set(q.code, q.id);
    }

    // Remove previous answers for these codes on this draft
    const qIds = codes.map((c) => have.get(c)).filter(Boolean);
    if (qIds.length) {
      await supa.from("survey_answers").delete().eq("response_id", response_id).in("question_id", qIds as string[]);
    }

    const rows = answers.map((a) => {
      const qid = have.get(a.code);
      let value_text: string | null = null;
      let value_num: number | null = null;
      let value_options: unknown = null;

      if (a.type === "number" && typeof a.value === "number") value_num = a.value;
      else if (a.type === "multi" && Array.isArray(a.value)) value_options = a.value;
      else if (a.value !== null && a.value !== undefined) value_text = String(a.value);

      return {
        response_id,
        question_id: qid,
        user_id: user.id,
        value_text,
        value_num,
        value_options: value_options ? JSON.stringify(value_options) : null,
      };
    });

    if (rows.length) {
      const { error: aErr } = await supa.from("survey_answers").insert(rows);
      if (aErr) return bad(aErr.message, origin, 500);
    }
  }

  return ok({ ok: true, response_id, draft: true }, origin);
});
