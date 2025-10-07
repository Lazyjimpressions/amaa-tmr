# Runbook — Supabase Verification (Functions, Secrets, Schema)

## Document Information
- **Created:** 2025-10-07
- **Last Updated:** 2025-10-07
- **Version:** 1.0
- **Owner:** Jonathan

## Goals
- Verify schema exists and RLS is enabled as defined in `/supabase/sql/001_init.sql`.
- Verify Edge Functions are deployed and respond with 200.
- Verify required secrets are set for applicable functions.

## Prereqs
- Project Ref: `ffgjqlmulaqtfopgwenf`
- Access to Supabase Dashboard

## Steps

### 1) Schema & Policies
1. Open Dashboard → SQL Editor
2. Run a read-only check:
   - `select count(*) from public.surveys;`
   - `select polname from pg_policies where schemaname='public' order by 1;`
3. Confirm tables present: `members`, `surveys`, `survey_questions`, `survey_responses`, `survey_answers`, `ai_briefs`, `question_embeddings`.
4. Confirm RLS enabled for all the above tables.

### 2) Secrets
1. Dashboard → Functions → Secrets
2. Confirm present:
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (auto)
   - `HUBSPOT_ACCESS_TOKEN` (webhook)
   - `HUBSPOT_APP_SECRET` (signature verification)
   - `ALLOWED_ORIGIN` (CORS)
   - `OPENAI_API_KEY` (AI brief)
3. Add any missing; redeploy affected functions afterwards.

### 3) Deploy/Verify Functions
1. Deploy (from local CLI or Dashboard):
   - `me`, `survey-submit`, `survey-save-draft`, `data-query-charts`, `ai-generate-brief`, `import-winter-2025` (verify JWT)
   - `hubspot-contact-upsert` (deploy with `--no-verify-jwt`)
2. Verify endpoints (200 OK):
   - `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me`
   - `.../survey-submit` (POST)
   - `.../survey-save-draft` (POST)
   - `.../hubspot-contact-upsert` (POST)
   - `.../data-query-charts`
   - `.../ai-generate-brief` (POST)
   - `.../import-winter-2025` (POST)
3. Check Logs → recent invocations and errors.

### 4) Membership Flow Sanity Check
1. Trigger HubSpot → contact.propertyChange for `membership_status___amaa`.
2. Confirm `members` upsert by email with `is_member` set accordingly.
3. Call `/me` with a valid JWT; verify `is_member` response.

## Output
- Update `supabase.md` and `supabase/functions/README.md` with verified status and timestamps.
