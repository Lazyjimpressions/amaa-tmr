# Survey Page Development Plan — AM&AA TMR MVP

## Document Information
- **Created:** 2025-10-12
- **Last Updated:** 2025-10-12
- **Version:** 2.0
- **Owner:** Jonathan

## 1) Overview

### Objective
Develop a comprehensive multi-page survey that captures AM&AA Market Survey data with proper Supabase integration, user authentication, and specialized deal data tables.

### Current State
- ✅ **Home Page**: Fully functional with React island and unified header/footer
- ✅ **Header/Footer System**: Survey CTA prominently placed
- ✅ **Design System**: CSS properly integrated
- ✅ **WordPress Theme**: Custom templates with proper routing
- ✅ **Supabase**: 14 Edge Functions deployed and functional
- ✅ **Database**: 7 tables with RLS, specialized survey response tables
- ✅ **Multi-Page Survey**: 5-page survey with progress tracking implemented
- ✅ **Authentication**: Magic link integration with Supabase
- ✅ **Deal Tables**: Dynamic inline editing for individual deal data
- ✅ **Survey Authentication Flow**: Fixed two-button issue (component architecture problem)
- ✅ **HubSpot Integration**: Form prepopulation working with profession_am_aa field
- ✅ **Single Button UX**: Global navigation handles authentication logic
- 🔄 **Magic Link Testing**: Test complete authentication flow
- 🔄 **Header Login State**: Update to show Supabase authentication

### Current Priority
**Test Magic Link Flow** - Complete authentication testing and header login state

## 2) Survey Page Requirements

### Core Functionality
1. **Multi-Page Survey Structure**
   - **Page 1: User Profile** → `survey_non_deal_responses`
   - **Page 2: Closed Deals** → `survey_deal_responses` (up to 5 deals)
   - **Page 3: Active Deals** → `survey_deal_responses` (up to 5 deals)
   - **Page 4: Looking Ahead** → `survey_non_deal_responses`
   - **Page 5: About You** → `survey_non_deal_responses`

2. **User Authentication**
   - Magic link authentication via Supabase
   - User session management
   - Progress persistence across sessions
   - HubSpot data prepopulation for members

3. **Deal Data Management**
   - Dynamic table generation based on deal count
   - Inline editing for individual deal details
   - Financial metrics capture (success fees, retainer fees)
   - Market factors and seller motivations

4. **Data Integration**
   - Submit responses to specialized Supabase tables
   - HubSpot contact sync
   - Analytics tracking
   - CORS-enabled Edge Functions

## 3) Technical Implementation

### WordPress Integration
- **Template**: `page-survey.php` (App Shell template)
- **Content Management**: Custom fields for survey questions
- **Admin Interface**: WordPress admin for question management
- **User Experience**: Clean, distraction-free survey interface

### React Components
- **Survey Form**: Dynamic form generation from WordPress data
- **Progress Tracking**: Visual progress indicators
- **Validation**: Real-time form validation
- **Save Draft**: Auto-save functionality
- **Submit**: Final submission with confirmation

### Supabase Integration
- **Authentication**: User login/logout
- **Data Storage**: Survey responses in `survey_responses` table
- **Edge Functions**: Survey submission and draft saving
- **RLS**: User can only access their own responses

### Design System Integration
- **Consistent Styling**: Use existing design tokens
- **Component Library**: Leverage existing button, input, and card components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## 4) Implementation Phases

### Phase 1: WordPress Survey Management (Week 1)
**Objective**: Set up WordPress admin interface for survey questions

**Tasks**:
1. **Custom Post Type**: Create `survey_question` post type
2. **Custom Fields**: Add fields for question text, type, options, conditional logic
3. **Admin Interface**: User-friendly question management
4. **API Endpoints**: REST API for survey data retrieval

**Deliverables**:
- WordPress admin interface for survey management
- REST API endpoints for survey data
- Basic question types (multiple choice, text, rating)

### Phase 2: Survey Page Template (Week 1)
**Objective**: Create the survey page template and basic structure

**Tasks**:
1. **Page Template**: Create `page-survey.php` with App Shell
2. **React Mount Point**: Add `#survey-root` for React components
3. **Basic Styling**: Apply design system to survey page
4. **Navigation**: Ensure proper header/footer integration

**Deliverables**:
- Survey page template
- React mount point
- Basic styling and navigation

### Phase 3: React Survey Components (Week 2)
**Objective**: Build the interactive survey components

**Tasks**:
1. **Survey Form Component**: Dynamic form generation
2. **Question Components**: Different question types
3. **Progress Component**: Visual progress tracking
4. **Validation**: Form validation and error handling
5. **Save Draft**: Auto-save functionality

**Deliverables**:
- React survey components
- Form validation
- Progress tracking
- Draft saving

### Phase 4: Supabase Integration (Week 2)
**Objective**: Connect survey to Supabase backend

**Tasks**:
1. **Authentication**: User login/logout integration
2. **Data Submission**: Submit responses to Supabase
3. **Draft Saving**: Save progress to database
4. **Error Handling**: Handle network and validation errors

**Deliverables**:
- Supabase authentication
- Data submission
- Draft saving
- Error handling

### Phase 5: Testing & Polish (Week 3)
**Objective**: Test and refine the survey experience

**Tasks**:
1. **User Testing**: Test survey flow and usability
2. **Mobile Testing**: Ensure mobile responsiveness
3. **Accessibility**: Test keyboard navigation and screen readers
4. **Performance**: Optimize loading and submission times
5. **Error Handling**: Test edge cases and error scenarios

**Deliverables**:
- Fully functional survey page
- Mobile-responsive design
- Accessibility compliance
- Performance optimization

## 5) Technical Specifications

### WordPress Custom Post Type
```php
// Survey Question Post Type
- question_text (text)
- question_type (select: multiple_choice, text, rating, yes_no)
- options (repeater field for multiple choice)
- required (boolean)
- conditional_logic (text)
- order (number)
```

### React Component Structure
```
SurveyPage/
├── SurveyForm.jsx
├── QuestionComponent.jsx
├── ProgressBar.jsx
├── SaveDraft.jsx
├── SubmitButton.jsx
└── ValidationMessage.jsx
```

### Supabase Schema
```sql
-- Survey responses table (already exists)
survey_responses (
  id, user_id, survey_id, question_id, 
  response_text, response_value, 
  created_at, updated_at
)
```

### API Endpoints
- `GET /wp-json/amaa/v1/survey/questions` - Get survey questions
- `POST /wp-json/amaa/v1/survey/submit` - Submit survey response
- `POST /wp-json/amaa/v1/survey/draft` - Save draft

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

### Immediate Actions (This Week)
1. **Create Survey Page Template**: Set up `page-survey.php`
2. **Custom Post Type**: Implement survey question management
3. **Basic React Components**: Start with simple form components
4. **Supabase Integration**: Connect authentication and data submission

### Success Criteria
- ✅ Survey page loads with proper styling
- ✅ Admin can create and manage survey questions
- ✅ Users can complete survey with progress tracking
- ✅ Data submits to Supabase successfully
- ✅ Mobile-responsive and accessible design

### Timeline
- **Week 1**: WordPress integration and basic template
- **Week 2**: React components and Supabase integration
- **Week 3**: Testing, polish, and deployment

---

**Ready to proceed with Survey Page Development!**
