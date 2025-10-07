# AM&AA — The Market Report (TMR) — Docs

Author: Jonathan • Updated: 2025-10-07

## What's here
- **PRD** — product requirements for MVP
- **Implementation Plan** — cradle→grave tasks & milestones
- **Architecture** — context & container views + survey logic spec
- **Runbooks** — deploy to WP Engine, Supabase init, HubSpot sync, CSV import, downloads
- **ADRs** — key decisions and rationale

## Quick links
- PRD: [/docs/prd/PRD.md](../docs/prd/PRD.md)
- Plan: [/docs/plans/IMPLEMENTATION_PLAN.md](../docs/plans/IMPLEMENTATION_PLAN.md)
- Supabase init: [/docs/runbooks/supabase-init.md](../docs/runbooks/supabase-init.md)
- Deploy to WPE: [/docs/runbooks/deploy-wpengine.md](../docs/runbooks/deploy-wpengine.md)

## Environments
- WP Engine Staging: `marketrepstg` (deploys from `staging` branch)
- WP Engine Prod: `thereport` (deploys from `main` branch)
- Supabase Project Ref: `ffgjqlmulaqtfopgwenf`
- **MCP Access**: ✅ Read/Write access to Supabase via Cursor MCP

---

## Status as of 2025-10-07

- WordPress (WPE): Minimal pages; only test flows for HubSpot email signup validation and the survey form exist. The broader UX/UI iteration and template conformance were not completed.
- Supabase: Database schema exists in repo; Edge Function code is present and aligned to shared utilities, but deployment and final secret configuration remain pending.
- HubSpot: Membership property strategy defined; full webhook-to-Supabase sync may not be active yet and requires verification before assuming production readiness.
- Secrets: Remaining keys (e.g., `OPENAI_API_KEY`, any `ADMIN_TOKEN`) must be set in Supabase before deploying functions.

## Membership source of truth
- HubSpot Contact property: **`membership_status___amaa`** (label "Active if member is active")
- Rule: value **"Active"** ⇒ member (true). Else ⇒ non-member (false).

## Downloads rule
- **Teaser** PDFs hosted on **HubSpot** (marketing).
- **Full & historical** PDFs hosted on **WP Engine** (members only).
