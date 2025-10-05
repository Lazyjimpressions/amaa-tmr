import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, getUser } from "../_shared/utils.ts";

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

    // Parse query parameters
    const url = new URL(req.url);
    const survey_id = url.searchParams.get('survey_id');
    const chart_type = url.searchParams.get('chart_type') || 'deal_counts';

    if (!survey_id) {
      return bad('Missing survey_id parameter');
    }

    // For MVP, return stub data
    const stubData = {
      deal_counts: {
        labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'],
        data: [45, 52, 38, 61]
      },
      industry_breakdown: {
        labels: ['Technology', 'Healthcare', 'Manufacturing', 'Services'],
        data: [35, 28, 22, 15]
      },
      deal_sizes: {
        labels: ['<$1M', '$1-5M', '$5-10M', '>$10M'],
        data: [25, 40, 20, 15]
      }
    };

    return ok({
      success: true,
      chart_type,
      data: stubData[chart_type] || stubData.deal_counts,
      note: 'Stub data for MVP - will be replaced with real analytics in Phase 2'
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
