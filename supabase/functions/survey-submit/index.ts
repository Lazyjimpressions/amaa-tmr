// Accepts: { survey_slug: "2025-winter", answers: [{ code, type, value }] }
// type: "single"|"multi"|"number"|"text"
// value: string | number | string[] | null
// Creates survey_responses row (submitted_at=now) + survey_answers rows.
// No guessed data. Creates survey_questions on-the-fly if code missing (text=code).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ok, bad, cors, json, service, getUser, lower,
} from "../_shared/utils.ts";

type Answer = { code: string; type: string; value: unknown };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const authHeader = req.headers.get("authorization") || undefined;
  const user = await getUser(authHeader);
  if (!user) return bad("unauthorized", origin, 401);

  const body = (await json(req)) as { survey_slug?: string; answers?: Answer[] };
  const slug = (body.survey_slug || "").trim();
  const answers = Array.isArray(body.answers) ? body.answers : [];

  if (!slug) return bad("missing_survey_slug", origin);
  if (answers.length === 0) return bad("no_answers", origin);

  const supa = service();

  // Find or create survey
  const { data: surveyRow, error: sErr } = await supa
    .from("surveys")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (sErr) return bad(sErr.message, origin, 500);
  if (!surveyRow) return bad("unknown_survey_slug", origin, 400);

  // Create response
  const submitted_at = new Date().toISOString();
  const { data: respIns, error: rErr } = await supa
    .from("survey_responses")
    .insert({
      survey_id: surveyRow.id,
      user_id: user.id,
      submitted_at,
      source: "web",
    })
    .select("id")
    .single();
  if (rErr) return bad(rErr.message, origin, 500);

  const response_id = respIns.id as string;

  // Build question lookup
  const codes = [...new Set(answers.map((a) => a.code).filter(Boolean))];
  let { data: qRows, error: qErr } = await supa
    .from("survey_questions")
    .select("id, code, type, survey_id")
    .eq("survey_id", surveyRow.id)
    .in("code", codes);
  if (qErr) return bad(qErr.message, origin, 500);

  // Create missing questions as text type defaulting to provided type/text=code
  const existing = new Map(qRows?.map((r: any) => [r.code, r]) || []);
  const missing = codes.filter((c) => !existing.has(c));
  if (missing.length > 0) {
    const toInsert = missing.map((code) => ({
      survey_id: surveyRow.id,
      code,
      text: code,
      type: "text",
      version: 1,
    }));
    const { data: created, error: cErr } = await supa
      .from("survey_questions")
      .insert(toInsert)
      .select("id, code, type, survey_id");
    if (cErr) return bad(cErr.message, origin, 500);
    for (const q of created || []) existing.set(q.code, q);
  }

  // Insert answers
  const rows = [];
  for (const a of answers) {
    const code = a.code?.trim();
    if (!code) continue;
    const q = existing.get(code);
    if (!q) continue;

    let value_text: string | null = null;
    let value_num: number | null = null;
    let value_options: unknown = null;

    if (a.type === "number" && typeof a.value === "number") {
      value_num = a.value;
    } else if (a.type === "multi" && Array.isArray(a.value)) {
      value_options = a.value;
    } else if (a.value === null || a.value === undefined) {
      // leave all nulls
    } else {
      value_text = String(a.value);
    }

    rows.push({
      response_id,
      question_id: q.id,
      user_id: user.id,
      value_text,
      value_num,
      value_options: value_options ? JSON.stringify(value_options) : null,
    });
  }

  if (rows.length) {
    const { error: aErr } = await supa.from("survey_answers").insert(rows);
    if (aErr) return bad(aErr.message, origin, 500);
  }

  return ok({ ok: true, response_id, answers_written: rows.length }, origin);
});
