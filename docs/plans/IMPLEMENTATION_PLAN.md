# Implementation Plan — TMR MVP (Host Survey In-Portal)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

Owner: Jonathan • Code Freeze: TBA • Launch: TBA

## 0) Preconditions
- WPE staging live; CI → WPE working (✅).
- Supabase project ref: ffgjqlmulaqtfopgwenf; `/supabase/sql/001_init.sql` applied (auth.uid()).
- Secrets available: Supabase anon/service, HubSpot token, OpenAI (optional), GA ID (optional).
- **Downloads decision**: Teaser on HubSpot; Full/historical on WPE.

## 1) Current State Analysis

### ✅ Ready Components
- **Supabase Schema**: ✅ **FULLY DEPLOYED** - All tables exist with RLS enabled
- **Database Tables**: `members`, `surveys`, `survey_questions`, `survey_responses`, `survey_answers`, `ai_briefs`, `question_embeddings`
- **RLS Policies**: All tables have RLS enabled with proper foreign key relationships
- **WordPress Theme**: Basic structure with templates
- **WordPress Plugin**: Placeholder structure exists
- **Edge Functions**: ✅ **READY FOR DEPLOYMENT** - All 7 functions updated with shared utilities
- **MCP Access**: ✅ **CONFIGURED** - Read/Write access to Supabase via Cursor

### 🔄 Ready for Deployment
- **Edge Functions**: All functions updated and ready for deployment
- **Secrets**: Core Supabase secrets configured, need OpenAI key and admin token
- **WordPress Integration**: Plugin needs Supabase connectivity
- **Survey UI**: React components not implemented

## 2) Workstreams (Detailed Implementation)

### A. Edge Functions (CRITICAL - Week 1)
**Priority 1: Core Functions**
- Create `me` function (user context/membership check)
- Create `survey-submit` function (survey submission)
- Create `hubspot-contact-upsert` function (membership sync)

**Priority 2: Supporting Functions**
- Create `survey-save-draft` function (optional draft saving)
- Create `data-query-charts` function (stub for charts)
- Create `ai-generate-brief` function (AI brief generation)
- Create `import-winter-2025` function (CSV import)

**DOD**: All 7 Edge Functions created and deployed with proper error handling

### B. WordPress Plugin Integration (Week 1-2)
**Current State**: Plugin has placeholder `tmr_is_member()` function
**Required Changes**:
- Replace placeholder with Supabase EF call to `/me`
- Add Supabase client configuration
- Implement authentication flow (magic link)
- Add environment variable management
- Update `[tmr_member_only]` shortcode to use real membership check

**DOD**: Plugin successfully calls Supabase and reflects membership status

### C. Survey UI Implementation (Week 2)
**Current State**: Templates have React mount points (`#tmr-survey`, `#tmr-insights`)
**Required Implementation**:
- Build React multi-step survey component
- Integrate with `survey-submit` Edge Function
- Add form validation and error handling
- Implement progress tracking
- Add success/error states

**DOD**: Complete survey flow from start to submission

### D. Downloads Implementation (Week 2)
**Teaser Downloads (HubSpot)**:
- Configure HubSpot file hosting
- Add teaser download buttons (always visible to authenticated users)
- Implement click tracking

**Full Downloads (WP Engine)**:
- Upload full reports to `/wp-content/uploads/reports/<slug>/`
- Add gated download buttons (members only)
- Implement access control

**DOD**: Both download types working with proper gating

### E. Analytics Integration (Week 2-3)
**Google Analytics**:
- Add GA tracking for key events: `auth_login`, `survey_start`, `survey_submit`, `download_full`, `download_teaser`
- Implement performance monitoring

**HubSpot Analytics**:
- Optional: Add HubSpot event tracking
- Sync membership status changes

**DOD**: All key events tracked and visible in analytics

### F. AI Brief Generation (Week 3)
**Implementation**:
- Complete `ai-generate-brief` Edge Function
- Add OpenAI integration
- Implement markdown rendering
- Add "AI-generated" labeling
- Store briefs in `ai_briefs` table

**DOD**: AI briefs generate within 10 seconds and are clearly labeled

### G. CSV Import (Week 3)
**Implementation**:
- Complete `import-winter-2025` Edge Function
- Add CSV validation and mapping
- Implement idempotency using respondent hash
- Add admin interface for uploads
- Handle field mapping for Winter 2025 data

**DOD**: CSV import works with proper validation and error reporting

### H. Testing & Polish (Week 4)
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

## 3) Milestones (Updated with Current State)

### M0: Foundation (D0–D3) - Week 1
- ✅ WordPress theme and plugin structure (DONE)
- ✅ Supabase schema applied (DONE) - **VERIFIED via MCP**
- ✅ All database tables exist with RLS enabled (DONE) - **VERIFIED via MCP**
- 🔄 **CRITICAL**: Create all 7 Edge Functions (NONE EXIST - **VERIFIED via MCP**)
- 🔄 **CRITICAL**: Implement WordPress plugin Supabase integration
- 🔄 **CRITICAL**: Basic authentication flow working

### M1: Core Survey Flow (D4–D7) - Week 2
- 🔄 Build React survey UI components
- 🔄 Integrate with `survey-submit` Edge Function
- 🔄 Implement downloads (teaser + full with gating)
- 🔄 Add basic analytics tracking

### M2: Advanced Features (D8–D10) - Week 3
- 🔄 AI brief generation working
- 🔄 CSV import functionality
- 🔄 Advanced analytics and monitoring
- 🔄 Performance optimization

### M3: Polish & Launch (D11–D14) - Week 4
- 🔄 End-to-end testing
- 🔄 Security review
- 🔄 Performance validation (p95 < 1.5s)
- 🔄 Production deployment

## 4) Critical Dependencies & Blockers

### Immediate Blockers
1. **Edge Functions Missing**: No Edge Functions exist (only legacy specs.md)
2. **WordPress Integration**: Plugin needs Supabase connectivity
3. **Environment Setup**: Secrets and configuration needed

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

