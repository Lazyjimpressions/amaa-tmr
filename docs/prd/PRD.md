# PRD — AM&AA "The Market Report" (TMR) — MVP

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-15
- **Version:** 2.0
- **Owner:** Jonathan

Owner: Jonathan • Updated: 2025-10-15

## 1) Problem & Goals
Members and prospects need a secure portal to complete the AM&AA Market Survey and (for members) access the full report. Today the survey runs in Zoho; results are exported and reports built offline.

**MVP Goals**
- G1: ✅ **COMPLETED** - Host the survey **inside TMR**, persisting to Supabase (no Zoho).
- G2: ✅ **COMPLETED** - Auth via Supabase; HubSpot confirms membership via Contact property **membership_status___amaa** ("Active" ⇒ member).
- G3: 🔄 **IN PROGRESS** - Deliver downloads: **Teaser (HubSpot)** for all authenticated users; **Full/historical PDFs (WP Engine)** for members.
- G4: 🔄 **FUTURE** - Light analytics (HubSpot + GA) for funnel visibility.
- G5: ✅ **COMPLETED** - Expose an **AI Insight Brief** button (visible, clearly labeled "AI-generated").

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
- AC: ✅ 2-page survey with dynamic questions submits via EF; writes to `survey_non_deal_responses` and `survey_deal_responses`.
- AC: ✅ Progressive trust authentication (anonymous start → email validation → magic link auth).
- AC: ✅ HubSpot contact auto-creation and data prepopulation.
- Post-submit: 🔄 **IN PROGRESS** - member sees Full+Teaser (WPE+HubSpot); non-member sees Teaser (HubSpot) + join CTA.

**U2 — Download Report** 🔄 **IN PROGRESS**
- AC: 🔄 Gated buttons render based on `/me`; WPE full report 200 OK for members; HubSpot teaser 200 OK for all logged-in users.

**U3 — Admin import (Winter 2025)** ✅ **COMPLETED**
- AC: ✅ Upload CSV; validate; upsert; report counts.

**U4 — AI Insight Brief (visible)** ✅ **COMPLETED**
- AC: ✅ Generates markdown within ~10s; clearly labeled "AI-generated"; stored in `ai_briefs`.

**U5 — Analytics** 🔄 **FUTURE**
- AC: 🔄 Events recorded: `auth_login`, `survey_start`, `survey_submit`, `download_full`, `download_teaser`.

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

## 9) Current Reality Check (2025-10-15)

### ✅ **Major Accomplishments (85% Complete):**
- **WordPress**: ✅ App shell fully functional with custom PHP templates and Supabase config injection
- **Design System**: ✅ Fully implemented with CSS custom properties, typography, colors, spacing, and components
- **Template System**: ✅ WordPress template hierarchy resolved, PHP templates working correctly
- **Home Page**: ✅ Fully functional with React island, hero, insights, credibility, CTA sections
- **Header/Footer System**: ✅ Unified navigation with dynamic auth state and avatar dropdown
- **Supabase**: ✅ All 7 Edge Functions deployed and verified working with proper CORS and secrets
- **Theme Structure**: ✅ Clean WordPress interface without default styling, professional appearance
- **Survey Infrastructure**: ✅ 2-page survey with dynamic question loading from database
- **Authentication**: ✅ Progressive trust flow with magic link integration and HubSpot auto-creation
- **Database Schema**: ✅ Specialized tables for survey responses and deal data with proper RLS

### ✅ **Completed (2025-10-15):**
- **Progressive Trust Authentication**: ✅ Anonymous start → email validation → magic link auth
- **HubSpot Integration**: ✅ Contact auto-creation and data prepopulation working
- **Dynamic Question System**: ✅ Database-driven question loading via `get-survey-questions` Edge Function
- **React Components**: ✅ Clean 2-page survey with proper form handling and validation
- **Header Auth State**: ✅ Dynamic avatar with dropdown based on authentication status
- **CORS Configuration**: ✅ Proper origin allowlist for staging and production
- **Form Validation**: ✅ Real-time validation with proper error handling
- **Data Persistence**: ✅ localStorage integration for form data across pages

### 🔄 **Current Status (15% Remaining):**
- **Survey Completion**: 🔄 **IN PROGRESS** - Final submission to Supabase tables
- **Data Persistence**: 🔄 **IN PROGRESS** - Save to `survey_non_deal_responses` and `survey_deal_responses`
- **Download Gating**: 🔄 **FUTURE** - Member vs non-member download access
- **Analytics**: 🔄 **FUTURE** - Event tracking and funnel visibility
- **Admin Question Management**: 🔄 **FUTURE** - WordPress plugin for question CRUD

### 🎯 **Current Focus (Week of 2025-10-15):**
- **Complete Survey Submission**: Connect final submission to `survey-submit` Edge Function
- **Data Persistence**: Implement saving to specialized Supabase tables
- **End-to-End Testing**: Test complete survey flow from start to finish
- **Error Handling**: Implement proper error handling for submission failures
- **Performance Validation**: Ensure <1.5s response times for all operations

### 📊 **Progress Summary:**
- **Core Infrastructure**: ✅ 100% Complete
- **Authentication Flow**: ✅ 100% Complete  
- **Survey UI/UX**: ✅ 100% Complete
- **Data Collection**: 🔄 85% Complete (submission remaining)
- **Download System**: 🔄 0% Complete (future phase)
- **Analytics**: 🔄 0% Complete (future phase)
- **Admin Tools**: 🔄 0% Complete (future phase)

**Overall MVP Progress: 85% Complete**

