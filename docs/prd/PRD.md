# PRD — AM&AA "The Market Report" (TMR) — MVP

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-22
- **Version:** 3.0
- **Owner:** Jonathan

Owner: Jonathan • Updated: 2025-10-22

## 1) Problem & Goals
Members and prospects need a secure portal to complete the AM&AA Market Survey and (for members) access the full report. Today the survey runs in Zoho; results are exported and reports built offline.

**MVP Goals**
- G1: ✅ **COMPLETED** - Host the survey **inside TMR**, persisting to Supabase (no Zoho). *Survey fully functional with 2-page structure, 35 questions, data persistence working.*
- G2: ✅ **COMPLETED** - Auth via Supabase; HubSpot confirms membership via Contact property **membership_status___amaa** ("Active" ⇒ member). *Magic link auth working, HubSpot integration functional.*
- G3: ❌ **NOT STARTED** - Deliver downloads: **Teaser (HubSpot)** for all authenticated users; **Full/historical PDFs (WP Engine)** for members. *No download functionality implemented.*
- G4: ❌ **NOT STARTED** - Light analytics (HubSpot + GA) for funnel visibility. *No analytics implemented.*
- G5: ❌ **NOT STARTED** - Expose an **AI Insight Brief** button (visible, clearly labeled "AI-generated"). *Not working.*

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
**U1 — Take Survey (any authenticated user)** ✅ **COMPLETED**
- AC: ✅ 2-page survey with dynamic questions submits via EF; writes to `survey_non_deal_responses` and `survey_deal_responses`. *Survey fully functional with 35 questions, data persistence working.*
- AC: ✅ Progressive trust authentication (anonymous start → email validation → magic link auth). *Magic link auth working, token management functional.*
- AC: ✅ HubSpot contact auto-creation and data prepopulation. *HubSpot integration working, contact creation functional.*
- Post-submit: ❌ **NOT STARTED** - member sees Full+Teaser (WPE+HubSpot); non-member sees Teaser (HubSpot) + join CTA.

**U2 — Download Report** ❌ **NOT STARTED**
- AC: ❌ Gated buttons render based on `/me`; WPE full report 200 OK for members; HubSpot teaser 200 OK for all logged-in users. *No download buttons implemented.*

**U3 — Admin import (Winter 2025)** ❌ **NOT STARTED**
- AC: ❌ Upload CSV; validate; upsert; report counts. *Not done.*

**U4 — AI Insight Brief (visible)** ❌ **NOT STARTED**
- AC: ❌ Generates markdown within ~10s; clearly labeled "AI-generated"; stored in `ai_briefs`. *Not working.*

**U5 — Analytics** ❌ **NOT STARTED**
- AC: ❌ Events recorded: `auth_login`, `survey_start`, `survey_submit`, `download_full`, `download_teaser`. *No analytics implemented.*

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

## 7) Design Requirements & UX Standards

### Design Philosophy
- **"Never looks like WordPress"** - Users should experience a premium, product-grade interface
- **Innovative layout** - Asymmetric grids, scrollytelling, micro-interactions
- **Performance-first** - CLS < 0.05, LCP < 2.5s, TTI < 2.5s on 4G
- **Accessibility** - WCAG 2.1 AA compliance, focus management, screen reader support

### Architecture: WordPress App Shell (Option B)
- **Single deployment** on WP Engine (simpler ops)
- **React islands** for interactive components (`#survey-root`, `#insights-root`, `#app-root`)
- **Custom PHP templates** (marketing.php, app.php) with minimal Gutenberg chrome
- **Design system** with CSS custom properties and component library

### Design System Foundation
```css
/* Design Tokens */
:root {
  --color-brand-50: #f0f9ff;
  --color-brand-600: #0B3C5D;
  --color-brand-900: #1e3a8a;
  --color-accent-600: #F29F05;
  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Source Sans 3', system-ui, sans-serif;
  --space-4: 0.25rem; --space-8: 0.5rem; --space-16: 1rem;
  --space-32: 2rem; --space-64: 4rem; --space-96: 6rem;
  --radius-8: 8px;
  --shadow-100: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-200: 0 4px 12px rgba(0,0,0,0.15);
}
```

### Key Pages & Layouts
- **Homepage**: Asymmetric hero, scrollytelling insights, credibility band
- **Survey**: Multi-step stepper with progress, autosave, validation
- **Member Portal**: Dashboard cards, real-time data, seamless transitions
- **Insights**: Interactive charts, hover previews, data-driven cards
- **Pricing**: Member vs non-member tiles, FAQ, trust indicators

### AI-Powered Design Tools
- **Uizard**: Sketch-to-wireframe conversion
- **Visily**: Screenshot-to-wireframe + text prompts
- **Khroma**: AI color palette generation
- **Figma AI**: Auto-layout, component generation
- **Cursor AI**: Code generation from design descriptions

## 8) Risks / Constraints
- HubSpot → Supabase membership sync timeliness
- CSV mapping consistency
- Clearly labeling any stub data (no silent placeholders)
- Survey logic complexity deferred to Phase 2 (scaffold in place)
- **Design complexity**: Balancing innovation with WordPress constraints
- **Performance**: Maintaining < 1.5s p95 while adding rich interactions

---

## 9) Current Reality Check (2025-10-22)

### ✅ **Major Accomplishments (Infrastructure Complete):**
- **WordPress**: ✅ App shell fully functional with custom PHP templates and Supabase config injection
- **Design System**: ✅ Fully implemented with CSS custom properties, typography, colors, spacing, and components
- **Template System**: ✅ WordPress template hierarchy resolved, PHP templates working correctly
- **Home Page**: ✅ Fully functional with React island, hero, insights, credibility, CTA sections
- **Header/Footer System**: ✅ Unified navigation with dynamic auth state and avatar dropdown
- **Supabase**: ✅ All 25 Edge Functions deployed and verified working with proper CORS and secrets
- **Theme Structure**: ✅ Clean WordPress interface without default styling, professional appearance
- **Database Schema**: ✅ Specialized tables for survey responses and deal data with proper RLS

### ✅ **Survey System (Fully Functional):**
- **Progressive Trust Authentication**: ✅ Anonymous start → email validation → magic link auth *Fully working*
- **HubSpot Integration**: ✅ Contact auto-creation and data prepopulation *HubSpot integration working*
- **Dynamic Question System**: ✅ Database-driven question loading via `get-survey-questions` Edge Function *35 questions loaded and functional*
- **React Components**: ✅ 2-page survey with form handling *Survey fully functional with data persistence*
- **Header Auth State**: ✅ Dynamic avatar with dropdown based on authentication status *Working*
- **CORS Configuration**: ✅ Proper origin allowlist for staging and production
- **Form Validation**: ✅ Real-time validation with proper error handling *Working*
- **Data Persistence**: ✅ localStorage integration for form data across pages *Working*
- **Survey Completion**: ✅ Final submission to Supabase tables *7 survey responses, 2 non-deal, 9 deal responses recorded*
- **Data Persistence**: ✅ Save to `survey_non_deal_responses` and `survey_deal_responses` *Tables writable and functional*

### ❌ **Not Started:**
- **Download System**: ❌ **NOT STARTED** - No download functionality implemented
- **Analytics**: ❌ **NOT STARTED** - No analytics implemented
- **Admin Question Management**: ❌ **NOT STARTED** - No admin tools implemented
- **Winter 2025 Import**: ❌ **NOT STARTED** - Not done
- **AI Insight Brief**: ❌ **NOT STARTED** - Not working

### 🎯 **Current Focus (Week of 2025-10-22):**
- **Download System Implementation**: Implement teaser and full report downloads
- **Analytics Integration**: Add event tracking for survey completion and downloads
- **Admin Tools**: Implement question management and CSV import functionality
- **AI Brief Generation**: Complete AI insight brief functionality
- **Performance Optimization**: Ensure <1.5s response times for all operations

### 📊 **Progress Summary:**
- **Core Infrastructure**: ✅ 100% Complete
- **Authentication Flow**: ✅ 100% Complete (fully working)
- **Survey UI/UX**: ✅ 100% Complete (fully functional)
- **Data Collection**: ✅ 100% Complete (fully tested and working)
- **Download System**: ❌ 0% Complete (not started)
- **Analytics**: ❌ 0% Complete (not started)
- **Admin Tools**: ❌ 0% Complete (not started)

**Overall MVP Progress: ~70% Complete**

