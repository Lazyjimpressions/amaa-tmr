# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AM&AA "The Market Report" (TMR) is a WordPress-hosted survey and report platform built with Supabase backend. The system collects market survey data from members and non-members, with gated access to reports based on membership status.

**Key Stack:**
- **WordPress** (WP Engine) - App shell with custom PHP templates
- **Supabase** - Auth, PostgreSQL, Edge Functions (project ref: `ffgjqlmulaqtfopgwenf`)
- **HubSpot** - CRM, membership verification via `membership_status___amaa` property
- **React Islands** - Interactive components embedded in WordPress pages

## MCP Supabase Access

✅ **You have full read/write access** to Supabase project `ffgjqlmulaqtfopgwenf` via MCP tools
- Use MCP tools to query tables, deploy functions, check logs
- **Always verify Supabase state via MCP** before making assumptions
- Supabase is **online only** (not local) - SQL commands must be run in the online terminal manually
- Core Supabase secrets are configured; remaining: `OPENAI_API_KEY`, `ADMIN_TOKEN`

## Architecture

### WordPress App Shell (Custom Templates)
- **Template System**: Custom PHP templates, minimal Gutenberg
  - `page-marketing.php` - Marketing pages (homepage, pricing)
  - `page-survey.php` - Survey flow
  - `page-app.php` - Member portal (future)
- **Routes**: `/app/*` routes to app shell via `inc/routes.php`
- **React Islands**: Mounted at `#survey-root`, `#homepage-root`, `#app-root`
- **Theme Location**: `wp-content/themes/amaa-tmr/`

### Supabase Backend
- **Auth**: Magic link authentication (not HubSpot) - see ADR 0001
- **RLS**: All user tables anchored to `auth.uid()`
- **Edge Functions** (7 deployed):
  - `check-membership` - HubSpot membership verification
  - `survey-save-draft` - Auto-save survey progress
  - `survey-save-public` - Anonymous survey data save
  - `survey-submit` - Final submission
  - `hubspot-email-lookup` - User lookup via email
  - `hubspot-contact-upsert` - Contact sync
  - `ai-generate-brief` - AI insights (stub)

### Database Schema (Specialized Survey Tables)
- **`survey_non_deal_responses`** - User profile, market sentiment, predictions
- **`survey_deal_responses`** - Individual deal data (up to 5 per respondent)
- **`survey_responses`** - Response containers
- **`survey_questions`** - Question definitions with versioning
- **`members`** - Membership status synced from HubSpot

See `docs/arch/database-integration.md` for detailed field mappings.

## Design System

**Philosophy**: "Never looks like WordPress" - premium product-grade UI

**CSS Architecture:**
- Design tokens in `assets/css/design-tokens.css`
- Component library in `assets/css/components.css`
- Template-specific: `marketing.css`, `survey.css`, `app.css`
- Custom properties: colors, spacing, typography, shadows

**Fonts:**
- Headings: 'Inter'
- Body: 'Source Sans 3'

**Key Colors:**
- Brand: `--color-brand-600` (#0B3C5D)
- Accent: `--color-accent-600` (#F29F05)

## Cache Busting (Critical)

**All assets use `filemtime()` for automatic cache busting:**
```php
wp_enqueue_style('name', $url, array(), filemtime(get_template_directory() . '/path/to/file.css'));
```

**Never use hardcoded versions like `'1.0.0'`** - this was causing persistent caching issues on WP Engine staging.

After deployment to staging, manually purge WP Engine cache via portal (my.wpengine.com).

## Development Workflow

### Local Development
- Work locally in `/Users/jonathanhughes/Development/amaa-tmr`
- Changes committed to GitHub
- GitHub Actions deploy to WP Engine on push

### Deployment
- **Staging**: Push to `staging` branch → `marketrepstg.sftp.wpengine.com`
- **Production**: Push to `main` branch → `thereport.sftp.wpengine.com`
- **Workflow**: `.github/workflows/deploy-wpe.yml` (SFTP deploy)
- **Manual cache purge required** after each deploy

### Supabase Edge Functions
- Located in `supabase/functions/`
- Shared utilities in `supabase/functions/_shared/utils.ts`
- Deploy via MCP tools or Supabase CLI
- CORS configured for staging/production origins

## Key Files & Locations

**WordPress Theme:**
- `wp-content/themes/amaa-tmr/functions.php` - Main theme setup, enqueues
- `wp-content/themes/amaa-tmr/inc/survey.php` - Survey CPT, REST endpoints
- `wp-content/themes/amaa-tmr/inc/routes.php` - Custom routing
- `wp-content/themes/amaa-tmr/assets/js/survey-island.js` - Survey React app
- `wp-content/themes/amaa-tmr/assets/js/homepage-island.js` - Homepage React app

**Documentation:**
- `docs/prd/PRD.md` - Product requirements, current status
- `docs/arch/database-integration.md` - Survey → DB field mappings
- `docs/adrs/` - Architecture decision records
- `docs/runbooks/` - Deployment, Supabase init, HubSpot sync

**Cursor Rules:**
- `.cursorrules` - MCP access, verification protocol

## Membership Logic

**Source of Truth:** HubSpot Contact property `membership_status___amaa`
- Value `"Active"` → member (access to full reports)
- Else → non-member (teaser only)

**Downloads:**
- **Teaser PDFs**: Hosted on HubSpot (all authenticated users)
- **Full/Historical PDFs**: Hosted on WP Engine (members only)

## Survey Flow (Current Status: 40% Complete)

**Authentication:** Progressive trust
1. Anonymous start (email collection)
2. Email validation
3. Magic link authentication via Supabase

**Pages:**
1. User Profile → `survey_non_deal_responses`
2. Closed Deals → `survey_deal_responses` (deal_status='closed')
3. Active Deals → `survey_deal_responses` (deal_status='open')
4. Looking Ahead → `survey_non_deal_responses`
5. About You → `survey_non_deal_responses`

**Data Persistence:**
- Auto-save via `survey-save-draft` Edge Function
- Final submit via `survey-submit` Edge Function
- LocalStorage for form state between pages

## REST API Endpoints

**WordPress REST (defined in inc/survey.php):**
- `GET /wp-json/amaa/v1/survey/questions` - Get survey questions
- `POST /wp-json/amaa/v1/survey/submit` - Submit response (placeholder)
- `GET /wp-json/amaa/v1/auth/status` - Check WordPress auth
- `POST /wp-json/amaa/v1/auth/login` - WordPress login
- `POST /wp-json/amaa/v1/auth/logout` - WordPress logout

**Supabase Edge Functions:**
- See `supabase/functions/specs.md` for detailed API specs

## Verification Protocol (Mandatory)

Before making changes:
1. ✅ **Use MCP tools** to verify Supabase state
2. ✅ **Search codebase** for existing implementations
3. ✅ **Read existing docs** (PRD.md, IMPLEMENTATION_PLAN.md)
4. ✅ **Never assume** deployment status without verification
5. ✅ **Ask for clarification** when uncertain

See `docs/runbooks/VERIFICATION_PROTOCOL.md` for complete checklist.

## Current Focus (as of 2025-10-15)

**Completed (~30% MVP):**
- ✅ WordPress app shell, design system, template hierarchy
- ✅ All 7 Edge Functions deployed
- ✅ Database schema with specialized survey tables
- ✅ Homepage with React island

**In Progress:**
- 🔄 Survey UI/UX completion
- 🔄 HubSpot form prepopulation (buggy)
- 🔄 Progressive trust authentication

**Not Started:**
- ❌ Download system
- ❌ Analytics (GA + HubSpot events)
- ❌ Admin tools (Winter 2025 CSV import)
- ❌ AI Insight Brief functionality

## Common Gotchas

1. **Cache Issues**: Always use `filemtime()`, never hardcoded versions
2. **Template Hierarchy**: WordPress may load unexpected templates - check `template_include` filter
3. **RLS**: Edge Functions need service role to bypass RLS
4. **CORS**: Supabase Edge Functions must have staging/production origins allowlisted
5. **Supabase is Online**: No local Supabase - all SQL must be run via online console
6. **HubSpot Property**: `membership_status___amaa` (three underscores) not two

## Additional Resources

- **Supabase Project**: https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf
- **WP Engine Portal**: https://my.wpengine.com
- **Staging Site**: marketrepstg.wpengine.com
- **Production Site**: thereport.wpengine.com
