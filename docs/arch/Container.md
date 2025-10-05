# C4 — Container View (MVP)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

1) WP Engine (WordPress)
- Theme: renders /home, /survey, /insights; mounts React bundles.
- Plugin: localizes Supabase config + EF endpoints; `[tmr_member_only]` shortcode.
- Downloads:
  - Teaser: HubSpot URL, always visible after login.
  - Full: WPE URL, visible only if `/me.is_member=true`.

2) React Micro-app (bundled in theme)
- `/survey`: multi-step form → `survey-submit` EF.
- `/insights`: AI brief button → `ai-generate-brief` EF (visible).

3) Supabase
- Auth: magic link; JWT for EF calls.
- Postgres: `surveys`, `survey_questions`, `survey_responses`, `survey_answers`, `members`, `ai_briefs`.
- RLS: `auth.uid()`; raw survey data is server-only.
- Edge Functions:
  - `me`
  - `survey-submit` (+ optional `survey-save-draft`)
  - `hubspot-contact-upsert`
  - `data-query-charts` (stub for v1 charts)
  - `ai-generate-brief`
  - `import-winter-2025` (admin)

4) HubSpot
- Contact property `membership_status___amaa` (Active ⇒ member).
- Hosts teaser PDFs.

5) OpenAI
- Chat completion → markdown brief → stored in `ai_briefs`.

