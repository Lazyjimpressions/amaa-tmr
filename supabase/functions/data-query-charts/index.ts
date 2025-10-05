// Explicit STUB. Returns empty datasets and a note. No fabricated values.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, json, getUser } from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const authHeader = req.headers.get("authorization") || undefined;
  const user = await getUser(authHeader);
  if (!user) return bad("unauthorized", origin, 401);

  const _body = await json(req); // { survey_slug, filters }
  // Intentionally no DB calls yet (Phase 2 will add aggregates)
  return ok(
    {
      status: "stub",
      note:
        "This endpoint currently returns an empty dataset until aggregate queries are implemented. No placeholder values are included.",
      series: [
        { key: "deal_volume", unit: "count", data: [] },
        { key: "participants", unit: "count", data: [] },
        { key: "industry_mix", unit: "percent", data: [] },
        { key: "deal_size_revenue", unit: "$M", data: [] },
        { key: "deal_size_ebitda", unit: "$M", data: [] },
      ],
    },
    origin,
  );
});
