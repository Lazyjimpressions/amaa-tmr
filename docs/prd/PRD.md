# PRD — AM&AA "The Market Report" (TMR) — MVP

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-12
- **Version:** 1.2
- **Owner:** Jonathan

Owner: Jonathan • Updated: 2025-10-07

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

## 9) Current Reality Check (2025-10-08)

### ✅ **Major Accomplishments:**
- **WordPress**: ✅ App shell fully functional with custom PHP templates (page-marketing.php, page-app.php)
- **Design System**: ✅ Fully implemented with CSS custom properties, typography, colors, spacing, and components
- **Template System**: ✅ WordPress template hierarchy resolved, PHP templates working correctly
- **Dashboard**: ✅ Working with design system applied, ready for more page creation
- **Supabase**: ✅ All 7 Edge Functions deployed and verified working with proper secrets
- **Theme Structure**: ✅ Clean WordPress interface without default styling, professional appearance

### 🔄 **Current Status:**
- **Pages**: Dashboard created and working; need to create remaining pages (Home, Survey, Reports, Insights)
- **HubSpot**: Property approach defined; webhook and membership sync require validation
- **Survey UI**: React islands ready but not yet implemented
- **Downloads**: Gating and hosting not yet implemented
- **Analytics**: Not implemented

### ✅ **Completed (2025-10-12):**
- **Home Page**: Fully functional with React island, hero, insights, credibility, CTA sections
- **Header/Footer System**: Unified navigation with survey CTA and user state
- **Design System Integration**: CSS properly applied to all pages
- **WordPress Theme**: Custom PHP templates with proper routing
- **React Components**: Homepage island with all sections implemented
- **Multi-Page Survey**: 5-page survey with progress tracking and deal tables
- **Authentication**: Magic link integration with Supabase
- **Database Schema**: Specialized tables for survey responses and deal data

### ✅ **Completed (2025-10-14):**
- **Survey Authentication Flow**: Fixed two-button issue - was component architecture problem, not caching
- **HubSpot Integration**: Form prepopulation working correctly with profession_am_aa field
- **Single Button UX**: Global navigation handles authentication logic for Page 1
- **Magic Link Flow**: Send Magic Link button working for unauthenticated users
- **Form Validation**: Email validation triggers HubSpot lookup and form prepopulation
- **React Component Architecture**: Fixed duplicate button rendering issue

### 🎯 **Current Focus:**
- **Magic Link Testing**: Test complete authentication flow with magic link callback
- **Header Login State**: Update header to show Supabase authentication instead of WordPress
- **Rate Limiting**: Fix 429 errors on Supabase requests
- **End-to-End Testing**: Complete survey flow with authentication
- **Performance Optimization**: Ensure <1.5s response times

