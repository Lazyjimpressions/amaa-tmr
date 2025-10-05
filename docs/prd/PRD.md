# PRD — AM&AA "The Market Report" (TMR) — MVP

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

Owner: Jonathan • Updated: 2025-10-05

## 1) Problem & Goals
Members and prospects need a secure portal to complete the AM&AA Market Survey and (for members) access the full report. Today the survey runs in Zoho; results are exported and reports built offline.

**MVP Goals**
- G1: Host the survey **inside TMR**, persisting to Supabase (no Zoho).
- G2: Auth via Supabase; HubSpot confirms membership via Contact property **membership_status___amaa** (“Active” ⇒ member).
- G3: Deliver downloads: **Teaser (HubSpot)** for all authenticated users; **Full/historical PDFs (WP Engine)** for members.
- G4: Light analytics (HubSpot + GA) for funnel visibility.
- G5: Expose an **AI Insight Brief** button (visible, clearly labeled “AI-generated”).

**Success**
- ≥70% invited respondents complete in-portal
- ≥90% of authenticated users reach a “submit survey” or “download report” outcome
- p95 form actions <1.5s; zero PII leakage; no placeholder/guessed data

## 2) Scope & Non-Goals
**In (MVP)**
- Supabase schema + RLS (`auth.uid()`).
- Edge Functions: membership check, survey submit/draft, **Winter 2025 CSV** import; basic chart data (stub ok); AI brief (visible).
- WPE: theme + “supabase-bridge” plugin; gating by `/me`.
- Downloads: **Teaser on HubSpot**, **Full/historical on WPE**.
- **Survey logic scaffold** (docs + DB fields reserved; engine implemented later).

**Out (later)**
- Full slicing/dicing UI, predictive analytics, PDF composition, billing/SSO, full survey logic engine.

## 3) Users & Access
- **Member**: full portal + full/historical report downloads; can take survey.
- **Non-member (registered)**: can take survey; **teaser only** downloads.
- **Admin**: import Winter 2025 CSV; publish links.

## 4) User Stories & AC (MVP)
**U1 — Take Survey (any authenticated user)**
- AC: Multi-step form submits via EF; writes to `survey_responses/answers`.
- Post-submit: member sees Full+Teaser (WPE+HubSpot); non-member sees Teaser (HubSpot) + join CTA.

**U2 — Download Report**
- AC: Gated buttons render based on `/me`; WPE full report 200 OK for members; HubSpot teaser 200 OK for all logged-in users.

**U3 — Admin import (Winter 2025)**
- AC: Upload CSV; validate; upsert; report counts.

**U4 — AI Insight Brief (visible)**
- AC: Generates markdown within ~10s; clearly labeled “AI-generated”; stored in `ai_briefs`.

**U5 — Analytics**
- AC: Events recorded: `auth_login`, `survey_start`, `survey_submit`, `download_full`, `download_teaser`.

## 5) Data & Rules
- RLS anchored to `auth.uid()`; user-owned tables have `user_id (uuid)`.
- Membership truth = HubSpot Contact **membership_status___amaa == "Active"** ⇒ `members.is_member = true`.
- Raw responses never exposed to browser; EF only.
- **Survey logic**: questions carry optional `logic`/`visibility` metadata; evaluation engine is **Phase 2**.

## 6) Integrations
- Supabase (Auth, Postgres, Edge Functions)
- HubSpot (Contact property `membership_status___amaa`, teasers hosted)
- WP Engine (hosting member PDFs; CI)
- OpenAI (AI brief)
- GA (light)

## 7) Risks / Constraints
- HubSpot → Supabase membership sync timeliness
- CSV mapping consistency
- Clearly labeling any stub data (no silent placeholders)
- Survey logic complexity deferred to Phase 2 (scaffold in place)

