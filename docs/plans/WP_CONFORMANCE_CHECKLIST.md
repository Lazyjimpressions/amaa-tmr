# WordPress Conformance Checklist — Design System & App Shell

## Document Information
- **Created:** 2025-10-07
- **Last Updated:** 2025-10-07
- **Version:** 1.0
- **Owner:** Jonathan

## Goals
- Apply design system across templates and assets
- Conform theme to app-shell architecture
- Enable membership gating and core flows

## Tasks

### A) Theme & Templates
- Verify `inc/routes.php` routes `/app/*` → `templates/app.php` and marketing pages → `templates/marketing.php`
- Ensure `parts/header.html` and `parts/footer.html` are included consistently
- Clean DOM wrappers in templates; add islands: `#survey-root`, `#insights-root`, `#app-root`

### B) Styles
- Finalize `assets/css/design-tokens.css` (colors, type, spacing, radius, shadows)
- Implement `assets/css/components.css` for Button, Input, Card, Grid, Section, Nav
- Update `assets/css/app.css` and `assets/css/marketing.css` for layout and page styles
- Enqueue styles in `functions.php` with correct dependencies (tokens → components → page)

### C) Scripts & Islands
- Implement `assets/js/app.js` bootstrap and per-route init
- Add React (or vanilla) islands mounting for survey and insights
- Confirm scripts are enqueued in `functions.php` and localized as needed

### D) Supabase Integration
- Load `@supabase/supabase-js` via CDN/bundle; initialize with publishable key
- Implement auth (magic link); store session; hydrate UI state
- Integrate membership check via `/me` Edge Function (after deployment)
 - Verify EF endpoints are reachable (expect 401 without JWT). After auth, call `/me` and render membership state.
 - Configure required secrets in Supabase (currently set unless noted):
   - `SUPABASE_URL` (set), `SUPABASE_ANON_KEY` (set), `SUPABASE_SERVICE_ROLE_KEY` (set)
   - `OPENAI_API_KEY` (set)
   - `ALLOWED_ORIGIN` (missing; set required for CORS)

### E) HubSpot & Downloads
- Add teaser links (HubSpot Files) to marketing/app templates
- Add member-only full download links (WPE), gated by membership
- Add click tracking for downloads (GA or HS)
 - `ADMIN_TOKEN` is set; verify webhook POST returns 200 with valid token and signature.

### F) Accessibility & Performance
- Audit keyboard focus, landmarks, contrast
- Optimize assets; lazy-load non-critical JS; preconnect to Supabase
- Target p95 < 1.5s actions; measure CLS/LCP/TTI

### G) QA
- Cross-browser and mobile testing
- Verify RLS boundaries via client queries
- Smoke test survey submit/draft flows

## Output
- Screenshots and short Loom of conformed app shell
- Updated docs with verification dates
