# Implementation Plan — TMR MVP (Host Survey In-Portal)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-08
- **Version:** 1.1
- **Owner:** Jonathan

Owner: Jonathan • Code Freeze: TBA • Launch: TBA

## 0) Preconditions
- WPE staging live; CI → WPE working (✅).
- Supabase project ref: ffgjqlmulaqtfopgwenf; `/supabase/sql/001_init.sql` applied (auth.uid()).
- Secrets available: Supabase anon/service, HubSpot token, OpenAI (optional), GA ID (optional).
- **Downloads decision**: Teaser on HubSpot; Full/historical on WPE.

## 1) Current State Analysis

### ✅ Ready Components (Repo)
- **Schema & SQL**: ✅ Present in repo (`/supabase/sql/001_init.sql`) with RLS design
- **Edge Functions**: ✅ Deployed and reachable (JWT-protected); see verification below
- **MCP Access**: ✅ Configured for Supabase (read/write via Cursor)

### ✅ Current State (2025-10-08) - VERIFIED
- **WordPress**: ✅ Theme structure exists with custom PHP templates (page-marketing.php, page-app.php)
- **Design System**: ✅ Design tokens exist with proper color system, typography, spacing
- **Edge Functions**: ✅ **14 functions deployed** (not 7 as previously claimed)
- **Database**: ✅ 7 tables with RLS, 6 members, 2 surveys, 2 responses
- **Supabase Bridge Plugin**: ✅ Exists with admin settings and shortcodes
- **Survey React Components**: ✅ Exist in code but not integrated

### ❌ CRITICAL BLOCKERS (2025-10-08) - VERIFIED
- **Home page**: ❌ Shows blank/empty content
- **Insights page**: ❌ Shows blank/empty content
- **Design System Integration**: ❌ CSS variables don't match (components.css vs design-tokens.css)
- **Template Routing**: ❌ Pages not loading content properly
- **WordPress Pages**: ❌ May not exist or aren't configured
- **HubSpot Integration**: 🔄 Webhook functions exist but need testing
- **Survey UI Integration**: 🔄 Components exist but not connected

## 2) Workstreams (Detailed Implementation)

### A. Design System & Wireframes 🔥 **CRITICAL BLOCKER**
**Current State**: ❌ Design system has CSS variable mismatches, pages show blank content
**Issues Found**:
1. ❌ **CSS Variables Mismatch**: components.css references undefined variables (--color-brand-600, --space-3, --radius-lg)
2. ❌ **Pages Not Loading**: Home and Insights pages show blank content
3. ❌ **Template Routing**: WordPress pages may not exist or aren't configured
4. ❌ **Design System Integration**: CSS not applying to pages

**IMMEDIATE ACTION REQUIRED**:
1. Fix CSS variable mismatches in components.css
2. Debug WordPress template routing
3. Create/configure missing WordPress pages
4. Verify design system applies correctly

**AI Tools to Use**:
- **Uizard**: Convert hand-drawn sketches to digital wireframes
- **Visily**: Screenshot-to-wireframe conversion + text prompts
- **Khroma**: AI color palette generation
- **Figma AI**: Auto-layout and component generation
- **Cursor AI**: Code generation from design descriptions

**DOD**: Complete wireframes, design system, and component specifications ready for development

#### **Detailed Design Setup Steps:**

**Step 1: Create Wireframes (2-3 days)**
- Use Uizard to convert sketches to digital wireframes
- Create wireframes for: Homepage, Survey, Member Portal, Insights, Pricing, Login
- Define user flows for member vs non-member journeys
- Document interaction patterns and micro-animations

**Step 2: Design System Foundation (1-2 days)**
- Use Khroma to generate color palettes
- Define typography scale and font pairings
- Create spacing system (4px base grid)
- Establish shadow and radius tokens
- Document component specifications

**Step 3: Component Library (2-3 days)**
- Design core components: Button, Card, Input, Select, Tag, Metric Card
- Create layout components: Section, Grid, Container
- Define interaction states and animations
- Document accessibility requirements

**Step 4: Technical Architecture (1 day)**
- Plan React island integration points
- Define CSS custom properties structure
- Create build system for design tokens
- Plan WordPress template structure

### B. Edge Functions ✅ **VERIFIED WORKING**
**Status**: ✅ **14 functions deployed** (not 7 as previously claimed)
**Core Functions**:
- ✅ `me` function (user context/membership check)
- ✅ `survey-submit` function (survey submission)
- ✅ `hubspot-contact-upsert` function (membership sync)
- ✅ `survey-save-draft` function (draft saving)
- ✅ `data-query-charts` function (stub for charts)
- ✅ `ai-generate-brief` function (AI brief generation)
- ✅ `import-winter-2025` function (CSV import)

**Additional Functions**:
- ✅ `check-membership` function (public membership check)
- ✅ `survey-submit-public` function (public survey submission)
- ✅ Multiple webhook test functions

**DOD**: ✅ All functions deployed and reachable; secrets configured

### C. WordPress App Shell Implementation 🔥 **CRITICAL BLOCKER**
**Current State**: ❌ Template structure exists but pages show blank content
**Issues Found**:
- ✅ Strip WordPress "look" - Gutenberg styles disabled, clean interface
- ✅ Create custom PHP templates (page-marketing.php, page-app.php)
- ❌ **Design system not working** - CSS variables don't match
- ✅ Set up React island mount points
- ❌ **Template routing broken** - pages not loading content

**IMMEDIATE ACTION REQUIRED**:
1. Fix CSS variable mismatches
2. Debug WordPress page routing
3. Create/configure missing pages
4. Test template loading

**DOD**: WordPress serves as app shell with working pages and design system

### D. HubSpot Integration (CRITICAL - Week 1) 🔥 **PRIORITY 3**
**Current State**: Property approach defined; webhook endpoint deployed; `ADMIN_TOKEN` present; signature verification pending
**Required Setup**:
1. **Confirm membership property**: Verify `membership_status___amaa` exists with "Active" value
2. **Configure webhooks**: Set up contact.propertyChange webhook to `hubspot-contact-upsert` function
3. **Add webhook security**: Implement X-HubSpot-Signature verification
4. **Host teaser files**: Upload teaser PDFs to HubSpot Files (publicly accessible)
5. **Test webhook flow**: Verify membership changes sync to Supabase

**DOD**: HubSpot webhooks working, teaser files hosted, membership sync verified

#### **Detailed HubSpot Setup Steps:**

**Step 1: Confirm Membership Property**
- Navigate to HubSpot → Settings → Objects → Contacts → Properties
- Search for `membership_status___amaa`
- Verify "Active" is a valid value option

**Step 2: Configure Private App Scopes**
- Go to Settings → Integrations → Private Apps → open your app
- Add scope: `crm.objects.contacts.read` (required for contact webhooks)
- Note the app secret for webhook verification

**Step 3: Set Up Webhooks**
- In Private App → Webhooks tab → Edit webhooks
- Set Target URL: `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/hubspot-contact-upsert`
- Add Contact → propertyChange subscription for `membership_status___amaa`
- Activate the webhook

**Step 4: Add Webhook Security & Admin Token**
- Add `HUBSPOT_APP_SECRET` to Supabase secrets
- Update `hubspot-contact-upsert` function to verify `X-HubSpot-Signature` header
- Implement HMAC-SHA256 verification with app secret + raw body
 - `ADMIN_TOKEN` is set; confirm webhook handler checks it and returns 200 with valid token

**Step 5: Host Teaser Files**
- Go to Marketing → Files → upload teaser PDFs
- Make files publicly accessible
- Copy URLs for WordPress integration

**Step 6: Test Webhook Flow**
- Use "Test this subscription" in HubSpot
- Manually change a contact's `membership_status___amaa` to Active/Inactive
- Verify Supabase `members` table updates (requires valid `ADMIN_TOKEN`)
- Confirm `/me` function returns correct `is_member` flag

### E. React Islands Implementation (Week 2) 🔥 **PRIORITY 4**
**Current State**: No React components or interactive UI
**Required Implementation**:
- Build React survey stepper with progress tracking
- Create member dashboard with real-time data
- Implement insights grid with hover previews
- Add micro-interactions and smooth transitions
- Integrate with Supabase Edge Functions

**DOD**: All interactive components working with design system integration

### F. WordPress Plugin Integration (Week 1-2)
**Current State**: Placeholder membership logic; Supabase connectivity pending
**Required Changes**:
- Replace placeholder with Supabase EF call to `/me`
- Add Supabase client configuration
- Implement authentication flow (magic link)
- Add environment variable management
- Update `[tmr_member_only]` shortcode to use real membership check

**DOD**: Plugin successfully calls Supabase and reflects membership status

### G. Survey UI Implementation (Week 2)
**Current State**: Templates have React mount points (`#tmr-survey`, `#tmr-insights`)
**Required Implementation**:
- Build React multi-step survey component
- Integrate with `survey-submit` Edge Function
- Add form validation and error handling
- Implement progress tracking
- Add success/error states

**DOD**: Complete survey flow from start to submission

### H. Downloads Implementation (Week 2)
**Teaser Downloads (HubSpot)**:
- Configure HubSpot file hosting
- Add teaser download buttons (always visible to authenticated users)
- Implement click tracking

**Full Downloads (WP Engine)**:
- Upload full reports to `/wp-content/uploads/reports/<slug>/`
- Add gated download buttons (members only)
- Implement access control

**DOD**: Both download types working with proper gating

### I. Analytics Integration (Week 2-3)
**Google Analytics**:
- Add GA tracking for key events: `auth_login`, `survey_start`, `survey_submit`, `download_full`, `download_teaser`
- Implement performance monitoring

**HubSpot Analytics**:
- Optional: Add HubSpot event tracking
- Sync membership status changes

**DOD**: All key events tracked and visible in analytics

### J. AI Brief Generation (Week 3)
**Implementation**:
- Complete `ai-generate-brief` Edge Function
- Add OpenAI integration
- Implement markdown rendering
- Add "AI-generated" labeling
- Store briefs in `ai_briefs` table

**DOD**: AI briefs generate within 10 seconds and are clearly labeled

### K. CSV Import (Week 3)
**Implementation**:
- Complete `import-winter-2025` Edge Function
- Add CSV validation and mapping
- Implement idempotency using respondent hash
- Add admin interface for uploads
- Handle field mapping for Winter 2025 data

**DOD**: CSV import works with proper validation and error reporting

### L. Testing & Polish (Week 4)
**Testing**:
- End-to-end testing of complete user flows
- Performance testing (p95 < 1.5s requirement)
- Security review
- Cross-browser testing

**Polish**:
- Error handling improvements
- Loading states and UX polish
- Documentation updates

**DOD**: Production-ready with all requirements met

## 3) Milestones (Updated with Design-First Approach)

### M0: Design Foundation ✅ **COMPLETED** (2025-10-08)
- ✅ **Design system implemented** with CSS custom properties, typography, colors, spacing
- ✅ **Component library built** with Button, Card, Input, Grid, Section components
- ✅ **UX standards established** for accessibility, performance, and user flows
- ✅ **WordPress integration** with custom PHP templates and clean styling
- ✅ **App shell working** with dashboard page functional and styled

### M1: Foundation ✅ **COMPLETED** (2025-10-08)
- ✅ WordPress theme and plugin skeletons exist
- ✅ Supabase schema script present and applied
- ✅ Edge Functions deployed and verified working
- 🔄 HubSpot integration setup pending (webhooks, teaser hosting)
- 🔄 WordPress plugin Supabase integration pending
- 🔄 Authentication flow pending

### M2: WordPress App Shell ✅ **COMPLETED** (2025-10-08)
- ✅ **Strip WordPress "look"** - Gutenberg styles disabled, clean interface
- ✅ **Create custom PHP templates** (page-marketing.php, page-app.php)
- ✅ **Implement design system** with CSS custom properties
- ✅ **Set up React island mount points**
- ✅ **Configure clean URLs and routing**

### M3: Core Survey Flow (D8–D11) - Week 2
- 🔄 Build React survey UI components
- 🔄 Integrate with `survey-submit` Edge Function
- 🔄 Implement downloads (teaser + full with gating)
- 🔄 Add basic analytics tracking

### M4: Advanced Features (D12–D15) - Week 3
- 🔄 AI brief generation working
- 🔄 CSV import functionality
- 🔄 Advanced analytics and monitoring
- 🔄 Performance optimization

### M5: Polish & Launch (D16–D19) - Week 4
- 🔄 End-to-end testing
- 🔄 Security review
- 🔄 Performance validation (p95 < 1.5s)
- 🔄 Production deployment

## 4) Critical Dependencies & Blockers

### Immediate Blockers (2025-10-07)
1. **Secrets & Wiring**: Most secrets set; `ALLOWED_ORIGIN` missing (CORS). App and plugin not wired to EFs
2. **WordPress Conformance**: Theme not updated to new design system and templates
3. **HubSpot Webhook**: Not configured/verified; membership sync uncertain

### Dependencies
- Supabase project access and configuration
- HubSpot API access and property setup
- OpenAI API key for AI features
- GA tracking setup

## 5) Risk Mitigation

### High Risk Items
- **Edge Functions**: Critical path blocker - start immediately
- **WordPress Integration**: Complex integration - allocate extra time
- **Performance**: p95 < 1.5s requirement - monitor closely

### Mitigation Strategies
- Start with core Edge Functions first
- Build simple WordPress integration before complex features
- Implement performance monitoring early
- Plan for iterative testing and optimization

