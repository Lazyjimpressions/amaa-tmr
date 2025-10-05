import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, service, getUser } from "../_shared/utils.ts";

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

    const supabase = service(authHeader);
    
    // Get member info from database
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('user_id, email, is_member, membership_level')
      .eq('user_id', user.id)
      .single();

    if (memberError && memberError.code !== 'PGRST116') {
      return bad('Database error: ' + memberError.message, undefined, 500);
    }

    // Return user context
    return ok({
      user_id: user.id,
      email: user.email,
      is_member: member?.is_member || false,
      membership_level: member?.membership_level || ''
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
