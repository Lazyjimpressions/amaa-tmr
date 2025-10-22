# AM&AA TMR Survey Testing Checklist

**Date:** 2025-10-22  
**Status:** Ready for Testing  
**Use:** Quick reference during testing execution

## Pre-Testing Setup ✅

- [x] **Database schema verified** - `users` table exists with `profession` column
- [x] **Edge Functions deployed** - All functions updated and active
- [x] **WordPress assets ready** - JavaScript, CSS, and React components loaded
- [x] **Test environment configured** - Playwright MCP tools ready
- [x] **Test data prepared** - Email accounts and HubSpot contacts ready

## Phase 2: Authentication Flow Testing

### 2.1 Survey Page Modal Display
- [ ] Navigate to `/survey` without authentication
- [ ] Verify modal displays immediately
- [ ] Check modal title is "Sign In"
- [ ] Verify email input field is present
- [ ] Verify "Send Magic Link" button is present
- [ ] Test modal close functionality
- [ ] Verify modal reopens when trying to access survey

### 2.2 Magic Link Authentication
- [ ] Enter test email (test@example.com)
- [ ] Click "Send Magic Link"
- [ ] Verify success message "Check your email!"
- [ ] Check email for magic link
- [ ] Click magic link
- [ ] Verify redirect to `/survey` Page 1
- [ ] Verify user is authenticated (no modal shows)

### 2.3 Header Login Modal
- [ ] Navigate to homepage
- [ ] Click header "Log In" button
- [ ] Verify modal opens
- [ ] Enter email and send magic link
- [ ] Click magic link
- [ ] Verify redirect to `/app/dashboard` (not `/survey`)

## Phase 3: Survey Page 1 Testing

### 3.1 Page 1 Display
- [ ] Navigate to `/survey` (authenticated)
- [ ] Verify Page 1 loads with title "About You"
- [ ] Check email field shows as read-only text with "✓ Verified" badge
- [ ] Verify form fields are present:
  - [ ] First Name (required)
  - [ ] Last Name (required)
  - [ ] Profession (optional)
  - [ ] US Zip Code (optional)
  - [ ] Country (dropdown, optional)
- [ ] Verify "Next →" button is present

### 3.2 HubSpot Data Pre-population
- [ ] Use test email that exists in HubSpot
- [ ] Complete magic link authentication
- [ ] Verify form pre-fills with HubSpot data:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Profession
  - [ ] US Zip Code
  - [ ] Country
- [ ] Verify email shows as read-only
- [ ] Verify other fields are editable

### 3.3 Form Validation
- [ ] Leave First Name empty, click "Next →"
- [ ] Verify validation error appears
- [ ] Fill in First Name
- [ ] Leave Last Name empty, click "Next →"
- [ ] Verify validation error appears
- [ ] Fill in Last Name
- [ ] Click "Next →"
- [ ] Verify form submits successfully

### 3.4 HubSpot Contact Creation
- [ ] Fill out complete Page 1 form
- [ ] Click "Next →"
- [ ] Verify "Saving..." state shows
- [ ] Check browser network tab for `hubspot-contact-create` API call
- [ ] Verify API call succeeds (200 response)
- [ ] Verify Page 2 loads
- [ ] Check HubSpot for new/updated contact
- [ ] Verify contact has all submitted data

### 3.5 Database Population
- [ ] Check `survey_non_deal_responses` table
- [ ] Verify record created with:
  - [ ] response_id (UUID)
  - [ ] user_id (matches authenticated user)
  - [ ] email (from authentication)
  - [ ] first_name, last_name, profession, us_zip_code, country
  - [ ] created_at timestamp
- [ ] Verify data matches form submission exactly

## Phase 4: Survey Page 2 Testing

### 4.1 Page 2 Display
- [ ] Complete Page 1 and proceed to Page 2
- [ ] Verify Page 2 loads with title "Market Survey Questions"
- [ ] Check that questions load from `survey_questions` table
- [ ] Verify question types render correctly:
  - [ ] Text inputs
  - [ ] Number inputs
  - [ ] Dropdowns/selects
  - [ ] Radio buttons
  - [ ] Checkboxes
- [ ] Verify "Submit Survey" button is present

### 4.2 Survey Question Design
- [ ] Verify question text matches `survey_questions` table
- [ ] Check question order matches database order
- [ ] Verify required questions are marked with *
- [ ] Check field types match question type:
  - [ ] "text" → input[type="text"]
  - [ ] "number" → input[type="number"]
  - [ ] "select" → select dropdown
  - [ ] "radio" → radio buttons
  - [ ] "checkbox" → checkboxes
- [ ] Verify validation rules work correctly

### 4.3 Conditional Deal Tables - Closed Deals
- [ ] Find "How many closed deals?" question
- [ ] Enter "0" in closed deals count
- [ ] Verify closed deals table is hidden
- [ ] Enter "3" in closed deals count
- [ ] Verify closed deals table appears
- [ ] Verify table has correct number of rows (3)
- [ ] Enter "0" again
- [ ] Verify closed deals table hides
- [ ] Test with different numbers (1, 2, 5)

### 4.4 Conditional Deal Tables - Active Deals
- [ ] Find "How many active deals?" question
- [ ] Enter "0" in active deals count
- [ ] Verify active deals table is hidden
- [ ] Enter "2" in active deals count
- [ ] Verify active deals table appears
- [ ] Verify table has correct number of rows (2)
- [ ] Enter "0" again
- [ ] Verify active deals table hides
- [ ] Test with different numbers (1, 4, 5)

### 4.5 Deal Table Field Types
- [ ] Show deal tables (enter count > 0)
- [ ] Verify field types are correct:
  - [ ] Industry: text input
  - [ ] Deal Value: number input (currency)
  - [ ] Cash at Close: number input (currency)
  - [ ] Buyer Type: select dropdown
  - [ ] Revenue: number input (currency)
  - [ ] EBITDA: number input (currency)
  - [ ] Growth Rate: number input (percentage)
  - [ ] Employees: number input (integer)
- [ ] Test validation:
  - [ ] Required fields marked with *
  - [ ] Number fields accept only numbers
  - [ ] Currency fields format correctly
  - [ ] Percentage fields validate range

### 4.6 Survey Submission
- [ ] Fill out all required fields
- [ ] Fill out deal tables (if applicable)
- [ ] Click "Submit Survey"
- [ ] Verify loading state shows
- [ ] Check browser network tab for `survey-submit` API call
- [ ] Verify API call succeeds (200 response)
- [ ] Verify redirect to `/app/dashboard`
- [ ] Check database tables for data:
  - [ ] `survey_responses`: main response record
  - [ ] `survey_non_deal_responses`: user profile data
  - [ ] `survey_deal_responses`: deal data (if applicable)

## Phase 5: Database Data Verification

### 5.1 Survey Response Record
- [ ] Check `survey_responses` table
- [ ] Verify record created with correct user_id
- [ ] Verify submitted_at timestamp is accurate
- [ ] Verify source field shows "web"
- [ ] Verify email field populated

### 5.2 User Profile Data
- [ ] Check `survey_non_deal_responses` table
- [ ] Verify user profile data saved correctly
- [ ] Verify all form fields populated
- [ ] Verify deal counts match user input
- [ ] Verify response_id links to survey_responses

### 5.3 Deal Data (if applicable)
- [ ] Check `survey_deal_responses` table
- [ ] Verify deal records created (if count > 0)
- [ ] Verify all deal fields populated correctly
- [ ] Verify deal_index increments correctly (1, 2, 3, etc.)
- [ ] Verify deal_type matches (closed/active)
- [ ] Verify response_id links to survey_responses

### 5.4 Users Table Updates
- [ ] Check `users` table
- [ ] Verify users table updated with form data
- [ ] Verify profession field populated
- [ ] Verify membership status correct
- [ ] Verify updated_at timestamp reflects changes

### 5.5 HubSpot Contact Verification
- [ ] Check HubSpot for contact with test email
- [ ] Verify contact properties:
  - [ ] firstname: matches form submission
  - [ ] lastname: matches form submission
  - [ ] profession_am_aa: matches form submission
  - [ ] zip: matches form submission
  - [ ] country: matches form submission
  - [ ] lifecyclestage: "subscriber"
  - [ ] hs_analytics_source: "DIRECT_TRAFFIC"
- [ ] Verify contact was created/updated after Page 1

## Phase 6: Dashboard Testing

### 6.1 Dashboard Personalization
- [ ] Complete survey and land on dashboard
- [ ] Verify welcome message shows user's email prefix
- [ ] Check member status badge (if applicable)
- [ ] Verify survey status shows "Completed"
- [ ] Check all dashboard elements are present:
  - [ ] KPI cards
  - [ ] Quick links
  - [ ] Navigation
- [ ] Verify dashboard is responsive

### 6.2 Dashboard Authentication Check
- [ ] Clear localStorage (simulate logout)
- [ ] Navigate to `/app/dashboard`
- [ ] Verify redirect to `/survey`
- [ ] Verify login modal appears
- [ ] Re-authenticate
- [ ] Verify dashboard loads correctly

## Phase 7: Edge Case Testing

### 7.1 Token Expiration
- [ ] Complete authentication
- [ ] Manually expire token in localStorage
- [ ] Try to access `/survey`
- [ ] Verify redirect to login modal
- [ ] Re-authenticate
- [ ] Verify normal flow continues

### 7.2 Network Error Handling
- [ ] Complete Page 1 form
- [ ] Simulate network failure (dev tools)
- [ ] Click "Next →"
- [ ] Verify error message appears
- [ ] Restore network
- [ ] Verify retry works

### 7.3 Survey Abandonment
- [ ] Complete Page 1 form
- [ ] Navigate away from page
- [ ] Check database for `survey_non_deal_responses` record
- [ ] Verify data is saved
- [ ] Return to survey
- [ ] Verify Page 1 data is restored

### 7.4 Form Validation Edge Cases
- [ ] Test with invalid email formats
- [ ] Test with extremely long text inputs
- [ ] Test with negative numbers where not allowed
- [ ] Test with special characters
- [ ] Test with empty required fields
- [ ] Test with invalid dropdown selections

## Phase 8: Cross-Browser Testing

### 8.1 Browser Compatibility
- [ ] Test complete flow in Chrome
- [ ] Test complete flow in Firefox
- [ ] Test complete flow in Safari
- [ ] Test complete flow in Edge
- [ ] Verify consistent behavior across browsers

### 8.2 Mobile Responsiveness
- [ ] Test on iPhone viewport (375x667)
- [ ] Test on Android viewport (360x640)
- [ ] Test on tablet viewport (768x1024)
- [ ] Verify modal displays correctly
- [ ] Verify form is usable on mobile
- [ ] Test touch interactions

## Phase 9: Performance Testing

### 9.1 Load Time Testing
- [ ] Measure initial page load time
- [ ] Measure modal open time
- [ ] Measure form submission time
- [ ] Measure API response times
- [ ] Verify all interactions are smooth
- [ ] Check for any console errors

### 9.2 API Response Testing
- [ ] Monitor API call response times
- [ ] Verify all API calls complete successfully
- [ ] Check for any failed requests
- [ ] Verify error handling works
- [ ] Test with slow network conditions

## Phase 10: Security Testing

### 10.1 Authentication Security
- [ ] Test with invalid tokens
- [ ] Test with expired tokens
- [ ] Test with malformed tokens
- [ ] Verify JWT validation works
- [ ] Test with different user contexts
- [ ] Verify no token leakage

### 10.2 Data Security
- [ ] Test with malicious input
- [ ] Test with SQL injection attempts
- [ ] Test with XSS attempts
- [ ] Verify data sanitization
- [ ] Test with oversized payloads
- [ ] Verify RLS policies work

## Test Execution Notes

### Current Status
- **Environment Setup:** ✅ Complete
- **Ready to Begin:** Phase 2 (Authentication Flow Testing)
- **Next Steps:** Start with Playwright MCP tools to test modal display

### Test Data Setup
- **Test Email:** test@example.com (for magic link testing)
- **HubSpot Test Contact:** Configured for pre-population testing
- **Database:** Cleared and ready for test data

### Issues Found
- None yet (testing not started)

### Next Actions
1. Begin Phase 2 testing with Playwright MCP
2. Test modal display on `/survey` for unauthenticated users
3. Test magic link authentication flow
4. Test header login modal integration

---

**Last Updated:** 2025-10-22  
**Next Review:** After Phase 2 completion
