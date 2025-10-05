// Admin-only CSV importer for "Market Survey Winter 2025" (or provided slug).
// Requires header: x-admin-token = ADMIN_TOKEN env.
// Accepts multipart/form-data { file } or text body of CSV.
// Optional JSON field map can be POSTed as a sidecar: { survey_slug, fieldMap: { "csv_header": {code,type} } }
// Creates missing survey_questions with text=code, type defaulting to "text" unless provided.
// Writes survey_responses (source='import', submitted_at from End_Date if present) and survey_answers.
// No guessed data; if a field is unrecognized, it becomes a question with code=normalized header.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ok, bad, cors, readCsvFromRequest, parseCsv, normalizeHeader,
  service, requireAdmin, sha256Hex,
} from "../_shared/utils.ts";

type FieldMapEntry = { code: string; type?: "single"|"multi"|"number"|"text" };
type FieldMap = Record<string, FieldMapEntry>;

const DEFAULT_SLUG = "2025-winter";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  if (!requireAdmin(req)) return bad("admin_only", origin, 401);

  // Parse optional JSON control payload (in querystring or header)
  // Simpler: read ?slug=... else default
  const url = new URL(req.url);
  const survey_slug = (url.searchParams.get("slug") || DEFAULT_SLUG).trim();

  const csvText = await readCsvFromRequest(req);
  if (!csvText) return bad("missing_csv", origin);

  const { headers, rows } = parseCsv(csvText);
  if (!headers.length) return bad("empty_csv", origin);

  const normalizedHeaders = headers.map(normalizeHeader);

  // Optional field map provided via separate JSON POST? Allow via ?fieldmap=base64(json) for simplicity here:
  let fieldMap: FieldMap = {};
  const fmParam = url.searchParams.get("fieldmap");
  if (fmParam) {
    try { fieldMap = JSON.parse(atob(fmParam)); } catch { fieldMap = {}; }
  }

  const supa = service();

  // Ensure survey exists
  const { data: survey, error: sErr } = await supa
    .from("surveys").select("id, slug").eq("slug", survey_slug).maybeSingle();
  if (sErr) return bad(sErr.message, origin, 500);
  if (!survey) return bad("unknown_survey_slug", origin, 400);

  // Preload existing questions
  const { data: existingQs } = await supa
    .from("survey_questions")
    .select("id, code")
    .eq("survey_id", survey.id);
  const qByCode = new Map((existingQs || []).map((q: any) => [normalizeHeader(q.code), q]));

  // Create missing questions for every column (except obvious metadata if you want to skip)
  const toCreate: any[] = [];
  for (let i = 0; i < normalizedHeaders.length; i++) {
    const nh = normalizedHeaders[i];
    if (!nh) continue;
    if (qByCode.has(nh)) continue;
    const mapEntry = fieldMap[headers[i]] || fieldMap[nh];
    toCreate.push({
      survey_id: survey.id,
      code: mapEntry?.code || nh,
      text: mapEntry?.code || headers[i], // keep original header as label
      type: mapEntry?.type || "text",
      version: 1,
    });
  }
  if (toCreate.length) {
    const { data: created, error: cErr } = await supa
      .from("survey_questions").insert(toCreate).select("id, code");
    if (cErr) return bad(cErr.message, origin, 500);
    for (const q of created || []) qByCode.set(normalizeHeader(q.code), q);
  }

  let imported = 0;
  const errors: Array<{ row: number; error: string }> = [];

  for (let rIdx = 0; rIdx < rows.length; rIdx++) {
    const row = rows[rIdx];
    if (row.length === 1 && row[0] === "") continue; // skip blank line

    // Compute submitted_at from a likely End_Date column if present
    const endDateIdx = headers.findIndex((h) => normalizeHeader(h) === "end_date");
    const endDateRaw = endDateIdx >= 0 ? row[endDateIdx] : "";
    const submitted_at = endDateRaw ? new Date(endDateRaw).toISOString() : null;

    // A hash to ensure idempotency
    const emailIdx = headers.findIndex((h) => normalizeHeader(h) === "email");
    const ipIdx = headers.findIndex((h) => normalizeHeader(h) === "ip_address");
    const hash = await sha256Hex(
      String(row[emailIdx] || ""),
      String(row[ipIdx] || ""),
      String(submitted_at || ""),
      survey_slug,
      String(rIdx),
    );

    const { data: resp, error: rErr } = await supa
      .from("survey_responses")
      .insert({
        survey_id: survey.id,
        user_id: null, // imported/unknown
        respondent_hash: hash,
        submitted_at,
        source: "import",
      })
      .select("id")
      .single();

    if (rErr) {
      errors.push({ row: rIdx + 2, error: `response_insert: ${rErr.message}` });
      continue;
    }
    const response_id = resp.id;

    const answerRows: any[] = [];

    for (let col = 0; col < headers.length; col++) {
      const rawHeader = headers[col];
      const nh = normalizedHeaders[col];
      const rawVal = row[col];

      if (rawVal === undefined || rawVal === null || rawVal === "") continue;

      const q = qByCode.get(nh);
      if (!q) continue;

      // naive typing: number if looks numeric, else text; multi unhandled in flat CSV unless map says so
      const mapEntry = fieldMap[rawHeader] || fieldMap[nh];
      const type = mapEntry?.type || "text";

      let value_text: string | null = null;
      let value_num: number | null = null;
      let value_options: unknown = null;

      if (type === "number") {
        const n = Number(String(rawVal).replace(/[^0-9\.\-]/g, ""));
        if (!Number.isNaN(n)) value_num = n;
        else value_text = String(rawVal);
      } else if (type === "multi") {
        // split on ; or | as a basic heuristic
        value_options = String(rawVal).split(/[;|]/).map((s) => s.trim()).filter(Boolean);
      } else {
        value_text = String(rawVal);
      }

      answerRows.push({
        response_id,
        question_id: q.id,
        user_id: null,
        value_text,
        value_num,
        value_options: value_options ? JSON.stringify(value_options) : null,
      });
    }

    if (answerRows.length) {
      const { error: aErr } = await supa.from("survey_answers").insert(answerRows);
      if (aErr) {
        errors.push({ row: rIdx + 2, error: `answers_insert: ${aErr.message}` });
        continue;
      }
    }

    imported++;
  }

  return ok({ ok: true, survey_slug, imported, errors }, origin);
});
