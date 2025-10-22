# Survey Page Development Plan — AM&AA TMR MVP

## Document Information
- **Created:** 2025-10-12
- **Last Updated:** 2025-10-22
- **Version:** 4.0
- **Owner:** Jonathan

## 1) Overview

### Objective
Develop a comprehensive 2-page survey that captures AM&AA Market Survey data with proper Supabase integration, user authentication, and specialized deal data tables. The survey uses a Supabase-first architecture with dynamic question loading and progressive trust authentication.

### Current State (As of 2025-10-22)
- ✅ **Home Page**: Fully functional with React island and unified header/footer
- ✅ **Header/Footer System**: Survey CTA prominently placed with dynamic auth state
- ✅ **Design System**: CSS properly integrated with survey-specific styling
- ✅ **WordPress Theme**: Custom templates with proper routing and Supabase config injection
- ✅ **Supabase**: 25 Edge Functions deployed and functional with proper CORS
- ✅ **Database**: 7 tables with RLS, specialized survey response tables
- ✅ **2-Page Survey**: User Profile + All Sections with dynamic question loading
- ✅ **Authentication**: Magic link integration with Supabase and HubSpot auto-creation
- ✅ **Progressive Trust Flow**: Anonymous start, email validation, magic link auth
- ✅ **HubSpot Integration**: Contact creation and data prepopulation
- ✅ **Dynamic Questions**: Database-driven question loading via `get-survey-questions`
- ✅ **Header Login State**: Dynamic avatar with dropdown based on auth status
- ✅ **Survey Completion**: Final submission to Supabase working (7 responses recorded)
- ✅ **Data Persistence**: Saving to `survey_non_deal_responses` and `survey_deal_responses` (2 non-deal, 9 deal responses)
- ✅ **Survey Components**: DealTable, MatrixQuestion, RadioArray, MultiPageSurvey working
- 🔄 **Admin Question Management**: Future WordPress plugin for question CRUD

### Current Priority
**Advanced Features** - Implement downloads, analytics, and admin tools

## 2) Survey Page Requirements

### Core Functionality
1. **2-Page Survey Structure** (Current Implementation)
   - **Page 1: User Profile** → `survey_non_deal_responses`
     - Email, name, location, profession
     - Magic link authentication
     - HubSpot data prepopulation
   - **Page 2: All Sections** → `survey_non_deal_responses` + `survey_deal_responses`
     - Basic user info (pre-populated from Page 1)
     - Deal-specific data (closed/active deals)
     - Predictions and outlook
     - Survey value assessment
     - Dynamic question loading from database

**Future Extension**: Option to expand to 5-page structure (Pages 3-5) for more detailed deal data collection

2. **Progressive Trust Authentication**
   - Anonymous survey start (no login required)
   - Email validation with HubSpot contact creation
   - Magic link authentication for data persistence
   - Seamless transition from anonymous to authenticated
   - Header state updates based on authentication status

3. **Dynamic Question Management**
   - Database-driven question loading via `get-survey-questions` Edge Function
   - Questions organized by sections (Basic user info, Deal-specific data, etc.)
   - Support for multiple question types (text, number, select, checkbox, radio, textarea)
   - Future admin interface for question CRUD operations

4. **Data Integration**
   - Submit responses to specialized Supabase tables (`survey_non_deal_responses`, `survey_deal_responses`)
   - HubSpot contact auto-creation and sync
   - CORS-enabled Edge Functions with proper origin allowlist
   - Real-time form validation and error handling

## 3) Technical Implementation

### Architecture Decision: Supabase-First Approach
**Why we moved from WordPress REST API to Supabase Edge Functions:**
- **Performance**: Direct database access without WordPress overhead
- **Security**: Built-in RLS and JWT authentication
- **Scalability**: Serverless functions with automatic scaling
- **CORS**: Native CORS handling for cross-origin requests
- **Real-time**: Built-in real-time capabilities for future features

### WordPress Integration
- **Template**: `page-survey.php` (App Shell template)
- **Configuration**: Supabase URL and Anon Key injection via `wp_localize_script`
- **Header Integration**: Dynamic auth state with avatar dropdown
- **User Experience**: Clean, distraction-free survey interface

### React Components
- **Survey Form**: Dynamic form generation from Supabase database
- **Progress Tracking**: Visual progress indicators (2 pages)
- **Validation**: Real-time form validation with proper error handling
- **Authentication**: Magic link flow with token management
- **Submit**: Final submission with confirmation

### Supabase Integration
- **Authentication**: Magic link authentication with token storage
- **Data Storage**: Specialized tables (`survey_non_deal_responses`, `survey_deal_responses`)
- **Edge Functions**: 7 deployed functions for survey operations
- **RLS**: User can only access their own responses
- **CORS**: Proper origin allowlist for staging and production

### Design System Integration
- **Consistent Styling**: Use existing design tokens
- **Component Library**: Leverage existing button, input, and card components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## 4) Implementation Phases

### Phase 1: Core Survey Infrastructure ✅ **COMPLETED**
**Objective**: Set up Supabase-first survey architecture

**Completed Tasks**:
1. **Database Schema**: 7 tables with RLS and specialized response tables
2. **Edge Functions**: 7 deployed functions with proper CORS
3. **WordPress Integration**: Supabase config injection and header auth state
4. **React Components**: 2-page survey with dynamic question loading

**Deliverables**: ✅
- Supabase database with specialized tables
- Edge Functions for survey operations
- WordPress theme integration with Supabase
- React survey components with authentication

### Phase 2: Progressive Trust Authentication ✅ **COMPLETED**
**Objective**: Implement anonymous start with magic link authentication

**Completed Tasks**:
1. **Anonymous Start**: Users can begin survey without login
2. **Email Validation**: HubSpot contact creation and data prepopulation
3. **Magic Link Flow**: Seamless authentication with token management
4. **Header Integration**: Dynamic auth state with avatar dropdown

**Deliverables**: ✅
- Progressive trust authentication flow
- HubSpot integration with auto-creation
- Magic link authentication
- Header auth state management

### Phase 3: Dynamic Question System ✅ **COMPLETED**
**Objective**: Database-driven question loading and rendering

**Completed Tasks**:
1. **Question Database**: 44 questions organized by sections
2. **Dynamic Loading**: `get-survey-questions` Edge Function
3. **Question Types**: Support for text, number, select, checkbox, radio, textarea
4. **Form Rendering**: Dynamic form generation with proper validation

**Deliverables**: ✅
- Database-driven question system
- Dynamic form rendering
- Multiple question types
- Real-time validation

### Phase 4: Survey Completion ✅ **COMPLETED**
**Objective**: Implement final submission and data persistence

**Completed Tasks**:
1. ✅ **Final Submission**: Connected to `survey-submit` Edge Function
2. ✅ **Data Persistence**: Saving to `survey_non_deal_responses` and `survey_deal_responses`
3. ✅ **Completion Flow**: Success page and data confirmation
4. ✅ **Error Handling**: Handle submission errors gracefully

**Completed Deliverables**:
- ✅ Complete survey submission flow
- ✅ Data persistence to Supabase (7 responses, 2 non-deal, 9 deal responses)
- ✅ Success/error handling
- ✅ End-to-end testing

### Phase 5: Admin Question Management 🔄 **FUTURE**
**Objective**: WordPress plugin for question CRUD operations

**Future Tasks**:
1. **WordPress Plugin**: Admin interface for question management
2. **Question CRUD**: Create, read, update, delete questions
3. **Section Management**: Organize questions by sections
4. **Question Types**: Support for all question types in admin

**Future Deliverables**:
- WordPress admin plugin
- Question management interface
- Section organization
- Question type support

## 5) Technical Specifications

### Current Database Schema
```sql
-- Core survey tables
surveys (id, slug, title, period_start, period_end, created_at)
survey_questions (id, survey_id, code, text, type, section, order, options, created_at)
survey_responses (id, user_id, survey_id, submitted_at, created_at)

-- Specialized response tables
survey_non_deal_responses (
  response_id, question_code, response_type,
  first_name, last_name, email, profession, us_zip_code, country,
  closed_deals_count, active_deals_count, economic_environment_second_half_2025,
  survey_value_rating, amaa_membership_interest, created_at
)

survey_deal_responses (
  response_id, question_code, response_type, deal_index, deal_type,
  total_consideration_ev_usd_m, industry, sub_industry, buyer_type,
  sell_side_success_fee_pct, sell_side_retainer_fee_usd_m,
  deal_period, deal_status, created_at
)
```

### React Component Structure (Current)
```
Survey Island (survey-island.js)
├── UserProfilePage (Page 1)
│   ├── Form validation
│   ├── Email validation with HubSpot
│   └── Magic link authentication
├── AllSectionsPage (Page 2)
│   ├── Dynamic question loading
│   ├── Section-based rendering
│   └── Form submission
├── ProgressBar
├── MultiPageSurvey (Main component)
└── Authentication handlers
```

### Supabase Edge Functions
- **`get-survey-questions`** - Fetch questions by survey slug
- **`check-membership`** - HubSpot contact lookup and creation
- **`me`** - User context and authentication
- **`survey-submit`** - Final survey submission
- **`survey-save-draft`** - Save draft responses
- **`hubspot-contact-upsert`** - HubSpot sync
- **`ai-generate-brief`** - AI brief generation (stub)

### WordPress Integration
- **Configuration**: Supabase URL/Anon Key via `wp_localize_script`
- **Header Auth**: Dynamic avatar with dropdown
- **Template**: `page-survey.php` with React mount point
- **CORS**: Proper origin allowlist for staging/production

## 6) Success Metrics

### User Experience
- **Completion Rate**: ≥70% of users complete the survey
- **Time to Complete**: Average completion time <15 minutes
- **Mobile Usage**: ≥40% of completions on mobile
- **Error Rate**: <5% of submissions have validation errors

### Technical Performance
- **Page Load**: <2.5s initial load time
- **Form Response**: <1.5s for save/submit actions
- **Mobile Performance**: <3s load time on 4G
- **Accessibility**: WCAG 2.1 AA compliance

### Business Impact
- **Conversion**: Survey completion drives membership signups
- **Data Quality**: High-quality survey responses for analysis
- **User Engagement**: Users return to complete surveys
- **Admin Efficiency**: Easy survey management for content team

## 7) Risk Mitigation

### Technical Risks
- **WordPress Performance**: Optimize database queries and caching
- **React Bundle Size**: Code splitting and lazy loading
- **Supabase Limits**: Monitor API usage and implement rate limiting
- **Mobile Compatibility**: Extensive mobile testing

### User Experience Risks
- **Form Abandonment**: Auto-save and progress indicators
- **Validation Errors**: Clear error messages and help text
- **Mobile Usability**: Touch-friendly interface and responsive design
- **Accessibility**: Screen reader testing and keyboard navigation

### Business Risks
- **Data Loss**: Regular backups and draft saving
- **Security**: Proper authentication and data validation
- **Compliance**: GDPR compliance for data collection
- **Scalability**: Handle high traffic during survey periods

## 8) Next Steps

### Immediate Actions (Current Priority)
1. **Complete Survey Submission**: Connect final submission to `survey-submit` Edge Function
2. **Data Persistence**: Implement saving to `survey_non_deal_responses` and `survey_deal_responses`
3. **End-to-End Testing**: Test complete survey flow from start to finish
4. **Error Handling**: Implement proper error handling for submission failures

### Success Criteria (Current Status)
- ✅ Survey page loads with proper styling
- ✅ 2-page survey structure with dynamic questions
- ✅ Progressive trust authentication flow
- ✅ HubSpot integration with auto-creation
- 🔄 **Survey completion and data persistence**
- ✅ Mobile-responsive and accessible design

### Timeline (Updated)
- **Week 1 (10/12-10/15)**: ✅ Core infrastructure and authentication
- **Week 2 (10/15-10/22)**: 🔄 Complete survey submission and testing
- **Week 3 (10/22-10/29)**: 🔄 Admin question management plugin (future)

### Current Status Summary
**Completed (100%)**:
- ✅ Supabase-first architecture with 25 Edge Functions
- ✅ 2-page survey with dynamic question loading
- ✅ Progressive trust authentication with magic links
- ✅ HubSpot integration with contact auto-creation
- ✅ WordPress theme integration with Supabase config
- ✅ React components with proper form handling
- ✅ Final survey submission implementation
- ✅ Data persistence to specialized tables (7 responses, 2 non-deal, 9 deal responses)
- ✅ End-to-end testing and validation
- ✅ Survey components: DealTable, MatrixQuestion, RadioArray, MultiPageSurvey

**Remaining (0%)**:
- 🔄 Future admin question management plugin
- 🔄 Advanced features (downloads, analytics, AI brief)

---

**Survey Page Development: 100% Complete - Survey system fully functional**
