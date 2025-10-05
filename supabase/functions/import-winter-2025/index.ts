import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { ok, bad, service, getUser, json, parseCsv, sha256Hex } from "../_shared/utils.ts";

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

    const body = await json(req);
    const { csv_data, survey_slug } = body;

    if (!csv_data || !survey_slug) {
      return bad('Missing csv_data or survey_slug');
    }

    const supabase = service(authHeader);

    // Get survey ID
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .select('id')
      .eq('slug', survey_slug)
      .single();

    if (surveyError || !survey) {
      return bad('Survey not found: ' + surveyError?.message, undefined, 404);
    }

    // Process CSV data using utility
    const { headers, rows: dataRows } = parseCsv(csv_data);

    let importedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const row of dataRows) {
      try {
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header.trim()] = row[index]?.trim() || '';
        });

        // Create respondent hash for idempotency using utility
        const respondentHash = await sha256Hex(
          rowData.email || '',
          rowData.submitted_at || '',
          survey_slug
        );

        // Insert survey response
        const { data: response, error: responseError } = await supabase
          .from('survey_responses')
          .upsert({
            survey_id: survey.id,
            respondent_hash: respondentHash,
            submitted_at: rowData.submitted_at || new Date().toISOString(),
            source: 'import'
          }, {
            onConflict: 'respondent_hash'
          })
          .select('id')
          .single();

        if (responseError) {
          errorCount++;
          errors.push(`Row ${importedCount + errorCount}: ${responseError.message}`);
          continue;
        }

        importedCount++;
      } catch (rowError) {
        errorCount++;
        errors.push(`Row ${importedCount + errorCount}: ${rowError.message}`);
      }
    }

    return ok({
      success: true,
      imported_count: importedCount,
      error_count: errorCount,
      total_rows: dataRows.length,
      errors: errors.slice(0, 10), // Limit to first 10 errors
      note: 'CSV import completed. Check errors array for any issues.'
    });
  } catch (error) {
    return bad('Internal server error: ' + error.message, undefined, 500);
  }
});
