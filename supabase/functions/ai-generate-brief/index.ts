// Generates a concise markdown brief with no fabricated metrics.
// If no aggregates are available yet, produces a methodology/takeaways-only note.
// Stores in ai_briefs (user-owned).
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  ok, bad, cors, json, getUser, service,
} from "../_shared/utils.ts";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const authHeader = req.headers.get("authorization") || undefined;
  const user = await getUser(authHeader);
  if (!user) return bad("unauthorized", origin, 401);

  const body = await json(req) as { survey_slug?: string; filters?: Record<string, unknown> };
  const survey_slug = (body.survey_slug || "").trim();
  const filters = body.filters || {};

  // In MVP we don't compute aggregates yet. Tell the model not to invent numbers.
  const system = [
    "You are an analyst writing a brief for the AM&AA Market Report.",
    "Never fabricate numbers, percentages, or totals. If specific metrics are unavailable, say so plainly.",
    "Be professional and analytical. Keep it concise (150-250 words).",
  ].join(" ");
  const userMsg = [
    `Survey period: ${survey_slug || "unspecified"}.`,
    `Filters: ${JSON.stringify(filters)}.`,
    "Data aggregates are not currently exposed. Focus on framing, methodology, and the types of insights that will become available once data loads.",
    "If citing anything quantitative, use qualitative phrasing only (e.g., "higher", "lower") and only if logically implied—otherwise, state that metrics are pending.",
  ].join("\n");

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) return bad("missing_openai_key", origin, 500);

  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMsg },
      ],
    }),
  });
  const j = await r.json().catch(() => ({}));
  const brief_md = j?.choices?.[0]?.message?.content || "AI-generated brief unavailable.";

  // Store brief (user-owned)
  const supa = service();
  const { error } = await supa.from("ai_briefs").insert({
    user_id: user.id,
    member_email: user.email || null,
    survey_id: null, // optional: join by slug later if needed
    filters,
    brief_md,
  });
  if (error) return bad(error.message, origin, 500);

  return ok({ brief_md, label: "AI-generated" }, origin);
});
