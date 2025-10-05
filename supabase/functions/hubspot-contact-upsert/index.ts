import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok, bad, cors, json, service, lower, isActiveMemberFromHubSpot } from "../_shared/utils.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(req.headers.get("origin") || undefined) });
  if (req.method !== "POST") return bad("method_not_allowed", req.headers.get("origin") || undefined, 405);

  const origin = req.headers.get("origin") || undefined;
  const body = await json(req) as Record<string, unknown>;

  // Support two shapes:
  // 1) Direct payload: { email, membership_status___amaa: "Active", membership_level? }
  // 2) HubSpot change event: { objectType, propertyName, propertyValue, objectId, ... }
  let email = lower((body as any).email);
  let status = (body as any).membership_status___amaa as string | undefined;
  let membership_level = (body as any).membership_level as string | undefined;

  // Try extracting from HubSpot event if direct fields absent
  if (!email && (body as any)?.objectType === "contact") {
    const props = (body as any).properties || (body as any).changedProperties || {};
    status = status ?? (props.membership_status___amaa?.value ?? props.membership_status___amaa);
    // email may be in 'email' property or 'properties.email.value'
    email = lower(
      (props.email?.value ??
        (props.email || (body as any).email)) as string | undefined,
    );
  }

  if (!email) return bad("missing_email", origin);
  const is_member = isActiveMemberFromHubSpot(status);

  const supa = service();
  const up = {
    email,
    is_member,
    membership_level: membership_level ?? null,
  };

  const { error } = await supa.from("members").upsert(up, { onConflict: "email" });
  if (error) return bad(`db_error: ${error.message}`, origin, 500);

  return ok({ ok: true, email, is_member }, origin);
});
