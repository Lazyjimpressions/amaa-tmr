# AM&AA — The Market Report (TMR) — Docs

Author: Jonathan • Updated: 2025-10-05

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

## Membership source of truth
- HubSpot Contact property: **`membership_status___amaa`** (label "Active if member is active")
- Rule: value **"Active"** ⇒ member (true). Else ⇒ non-member (false).

## Downloads rule
- **Teaser** PDFs hosted on **HubSpot** (marketing).
- **Full & historical** PDFs hosted on **WP Engine** (members only).
