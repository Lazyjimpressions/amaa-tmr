# C4 — System Context (MVP)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-12
- **Version:** 1.1
- **Owner:** Jonathan

Actors
- **First-time User**: Home → Login/Signup → Survey → Download Access
- **Member**: completes survey; downloads Full (WPE) + Teaser (HS)
- **Non-member (registered)**: completes survey; downloads Teaser (HS)
- **Admin**: imports Winter 2025 CSV; publishes links; manages survey questions

Systems
- WordPress (WP Engine): theme (amaa-tmr) + plugin (supabase-bridge), serves UI & links.
- Supabase: Auth, Postgres (RLS by auth.uid()), Edge Functions.
- HubSpot: membership source-of-truth (Contact `membership_status___amaa`); hosts teaser PDFs.
- OpenAI: LLM for AI brief (visible).

Trust boundaries
- Browser ↔ WP (public)
- Browser ↔ EFs (authenticated with JWT)
- EFs ↔ Supabase (service role)
- EFs ↔ HubSpot/OpenAI (tokens)

