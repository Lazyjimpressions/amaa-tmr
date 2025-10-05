import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, getUser, service } from "../_shared/utils.ts";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "GET") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const authHeader = req.headers.get("authorization") || undefined;

  // Validate JWT
  const user = await getUser(authHeader);
  if (!user?.email) return ok({ is_member: false }, origin);

  const supa = service(); // service role to bypass RLS for lookup by email (safer & simpler)
  const { data: row } = await supa
    .from("members")
    .select("is_member, membership_level, email, user_id")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  return ok(
    {
      email: user.email,
      is_member: !!row?.is_member,
      membership_level: row?.membership_level || null,
      user_id: row?.user_id || null,
    },
    origin
  );
});
