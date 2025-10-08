# AM&AA — The Market Report (TMR) — Docs

Author: Jonathan • Updated: 2025-10-08

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

## Status as of 2025-10-08

### ✅ **Major Accomplishments:**
- **WordPress App Shell**: ✅ Fully functional with custom PHP templates (page-marketing.php, page-app.php)
- **Design System**: ✅ Complete implementation with CSS custom properties, typography, colors, spacing, and components
- **Template System**: ✅ WordPress template hierarchy resolved, PHP templates working correctly
- **Dashboard**: ✅ Working with design system applied, professional appearance achieved
- **Supabase**: ✅ All 7 Edge Functions deployed and verified working with proper secrets

### 🔄 **Current Status:**
- **Pages**: Dashboard created and working; need to create remaining pages (Home, Survey, Reports, Insights)
- **HubSpot**: Property approach defined; webhook and membership sync require validation
- **Survey UI**: React islands ready but not yet implemented
- **Downloads**: Gating and hosting not yet implemented

## Membership source of truth
- HubSpot Contact property: **`membership_status___amaa`** (label "Active if member is active")
- Rule: value **"Active"** ⇒ member (true). Else ⇒ non-member (false).

## Downloads rule
- **Teaser** PDFs hosted on **HubSpot** (marketing).
- **Full & historical** PDFs hosted on **WP Engine** (members only).
