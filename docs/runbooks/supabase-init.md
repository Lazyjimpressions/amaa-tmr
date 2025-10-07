# Runbook — Supabase Init & Functions

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-07
- **Version:** 1.0
- **Owner:** Jonathan

## Project
- Ref: `ffgjqlmulaqtfopgwenf`

## SQL
1) Open Supabase Studio → SQL Editor
2) Paste & run `/supabase/sql/001_init.sql` (RLS anchored to `auth.uid()`)

## CLI (link & create functions)
```bash
cd /Users/jonathanhughes/Development/amaa-tmr
supabase login
supabase link --project-ref ffgjqlmulaqtfopgwenf
supabase functions new me
supabase functions new survey-submit
supabase functions new survey-save-draft
supabase functions new hubspot-contact-upsert
supabase functions new data-query-charts
supabase functions new ai-generate-brief
supabase functions new import-winter-2025
```

## Secrets (Functions → Configure or CLI)
```bash
supabase secrets set \
  SUPABASE_URL="https://ffgjqlmulaqtfopgwenf.supabase.co" \
  SUPABASE_SERVICE_ROLE_KEY="<SERVICE_ROLE_KEY>" \
  OPENAI_API_KEY="<OPENAI_KEY>" \
  HUBSPOT_TOKEN="<HUBSPOT_PRIVATE_APP_TOKEN>"
```

## Deploy
```bash
# Verify-JWT functions
supabase functions deploy me
supabase functions deploy survey-submit
supabase functions deploy survey-save-draft
supabase functions deploy data-query-charts
supabase functions deploy ai-generate-brief
supabase functions deploy import-winter-2025

# HubSpot webhook (no JWT)
supabase functions deploy hubspot-contact-upsert --no-verify-jwt
```

## Endpoints
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-submit
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-draft
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/hubspot-contact-upsert
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/data-query-charts
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/ai-generate-brief
- https://ffgjqlmulaqtfopgwenf.functions.supabase.co/import-winter-2025