import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, service, json, lower, isActiveMemberFromHubSpot } from "../_shared/utils.ts";

Deno.serve(async (req: Request) => {
  try {
    const body = await json(req);
    const { email, membership_status___amaa, membership_level } = body;

    if (!email) {
      return bad('Missing email');
    }

    const supabase = service();
    
    // Determine membership status using utility
    const is_member = isActiveMemberFromHubSpot(membership_status___amaa);

    // Upsert member record
    const { data: member, error: memberError } = await supabase
      .from('members')
      .upsert({
        email: lower(email),
        is_member,
        membership_level: membership_level || null
      }, {
        onConflict: 'email'
      })
      .select('id, email, is_member, membership_level')
      .single();

    if (memberError) {
      return bad('Failed to upsert member: ' + memberError.message, undefined, 500);
    }

    return ok({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        is_member: member.is_member,
        membership_level: member.membership_level
      }
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
