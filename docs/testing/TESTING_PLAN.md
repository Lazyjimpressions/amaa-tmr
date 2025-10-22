# AM&AA TMR Survey Login Modal & Authentication - Comprehensive Testing Plan

**Date:** 2025-10-22  
**Status:** Ready for Testing  
**Version:** 1.0

## Overview

This document outlines the comprehensive testing plan for the survey login modal and authentication redesign. All testing must be performed using Playwright MCP tools to verify the complete user workflow from authentication through survey completion and data persistence.

## Testing Environment

- **Supabase Project:** `ffgjqlmulaqtfopgwenf`
- **WordPress Environment:** WP Engine staging
- **Testing Tools:** Playwright MCP + Cursor Browser
- **Database:** Online Supabase (not local)

---

## Phase 1: Environment Verification ✅ COMPLETED

### 1.1 Database Schema Verification ✅
- [x] **`users` table exists** (renamed from `members`)
- [x] **`profession` column exists** and is nullable
- [x] **All required columns present**: id, email, is_member, membership_level, first_name, last_name, profession
- [x] **No foreign key constraints** reference old `members` table
- [x] **RLS policies** correctly configured for `users` table

### 1.2 Edge Functions Verification ✅
- [x] **`me` function** - Version 12 (uses `users` table with `profession` field)
- [x] **`check-membership` function** - Version 12 (lookup only, no minimal creation)
- [x] **`hubspot-contact-create` function** - Version 1 (new function for full contact creation)
- [x] **`hubspot-auth` function** - Version 3 (updated to use `users` table)
- [x] **`hubspot-contact-upsert` function** - Version 21 (updated to use `users` table)

### 1.3 WordPress Assets Verification ✅
- [x] **JavaScript files** loaded correctly with proper versioning
- [x] **CSS styles** applied following design system
- [x] **React components** mounting properly
- [x] **Supabase configuration** passed to frontend

---

## Phase 2: Authentication Flow Testing

### 2.1 Survey Page Modal Display
**URL:** `/survey`  
**Expected:** Login modal auto-displays for unauthenticated users

```javascript
// Playwright test steps:
1. Navigate to /survey
2. Verify modal is visible
3. Check modal has correct title "Sign In"
4. Verify email input field is present
5. Verify "Send Magic Link" button is present
6. Test modal close functionality
7. Verify modal reopens when trying to access survey without auth
```

**Success Criteria:**
- [ ] Modal displays immediately for unauthenticated users
- [ ] Modal cannot be bypassed
- [ ] Modal has proper styling and animations
- [ ] Modal close button works correctly

### 2.2 Magic Link Authentication Flow
**Steps:**
1. Enter valid email address
2. Click "Send Magic Link"
3. Verify success message displays
4. Check email for magic link
5. Click magic link
6. Verify redirect to `/survey` Page 1

```javascript
// Playwright test steps:
1. Fill email field with test@example.com
2. Click "Send Magic Link"
3. Verify success state shows "Check your email!"
4. Verify email contains magic link
5. Click magic link in email
6. Verify redirect to /survey Page 1
7. Verify user is authenticated (no modal shows)
```

**Success Criteria:**
- [ ] Magic link sent successfully
- [ ] Success message displays correctly
- [ ] Magic link redirects to correct page
- [ ] User authentication persists across page loads

### 2.3 Header Login Modal Integration
**URL:** Any page  
**Expected:** Header "Log In" button opens same modal

```javascript
// Playwright test steps:
1. Navigate to homepage
2. Click header "Log In" button
3. Verify modal opens
4. Enter email and send magic link
5. Click magic link
6. Verify redirect to /app/dashboard (not /survey)
```

**Success Criteria:**
- [ ] Header login uses same modal component
- [ ] Header login redirects to dashboard after auth
- [ ] Survey login redirects to survey after auth
- [ ] Modal state management works correctly

---

## Phase 3: Survey Page 1 Testing (User Profile)

### 3.1 Page 1 Display and Layout
**URL:** `/survey` (authenticated)  
**Expected:** Page 1 shows user profile form

```javascript
// Playwright test steps:
1. Navigate to /survey (authenticated)
2. Verify Page 1 loads with title "About You"
3. Check email field shows as read-only text with "✓ Verified" badge
4. Verify other fields are editable:
   - First Name (required)
   - Last Name (required)
   - Profession (optional)
   - US Zip Code (optional)
   - Country (dropdown, optional)
5. Verify "Next →" button is present
```

**Success Criteria:**
- [ ] Page 1 loads correctly for authenticated users
- [ ] Email field is read-only with verification badge
- [ ] All form fields are present and properly labeled
- [ ] Form validation works for required fields

### 3.2 HubSpot Data Pre-population
**Scenario:** Existing HubSpot contact  
**Expected:** Form pre-fills with HubSpot data

```javascript
// Playwright test steps:
1. Use test email that exists in HubSpot
2. Complete magic link authentication
3. Verify form pre-fills with HubSpot data:
   - First Name
   - Last Name
   - Profession
   - US Zip Code
   - Country
4. Verify email shows as read-only
5. Verify data can be edited (except email)
```

**Success Criteria:**
- [ ] HubSpot data pre-populates correctly
- [ ] All fields show correct HubSpot values
- [ ] Email remains read-only
- [ ] Other fields remain editable

### 3.3 Form Validation Testing
**Expected:** Required fields validation works correctly

```javascript
// Playwright test steps:
1. Leave First Name empty
2. Click "Next →"
3. Verify validation error appears
4. Fill in First Name
5. Leave Last Name empty
6. Click "Next →"
7. Verify validation error appears
8. Fill in Last Name
9. Click "Next →"
10. Verify form submits successfully
```

**Success Criteria:**
- [ ] Required field validation works
- [ ] Error messages are clear and helpful
- [ ] Form submission blocked until validation passes
- [ ] Optional fields don't block submission

### 3.4 HubSpot Contact Creation
**Expected:** Contact created/updated after Page 1 submission

```javascript
// Playwright test steps:
1. Fill out complete Page 1 form
2. Click "Next →"
3. Verify "Saving..." state shows
4. Check browser network tab for hubspot-contact-create API call
5. Verify API call succeeds (200 response)
6. Verify Page 2 loads
7. Check HubSpot for new/updated contact
8. Verify contact has all submitted data
```

**Success Criteria:**
- [ ] HubSpot contact creation API called
- [ ] API call succeeds with 200 response
- [ ] Contact created/updated in HubSpot
- [ ] All form data saved to HubSpot
- [ ] Page 2 loads after successful creation

### 3.5 Database Population (survey_non_deal_responses)
**Expected:** User profile data saved to database

```javascript
// Playwright test steps:
1. Complete Page 1 form submission
2. Check survey_non_deal_responses table
3. Verify record created with:
   - response_id (UUID)
   - user_id (matches authenticated user)
   - email (from authentication)
   - first_name, last_name, profession, us_zip_code, country
   - created_at timestamp
4. Verify data matches form submission exactly
```

**Success Criteria:**
- [ ] Record created in survey_non_deal_responses
- [ ] All form data saved correctly
- [ ] User ID matches authenticated user
- [ ] Timestamps are accurate

---

## Phase 4: Survey Page 2 Testing (All Questions)

### 4.1 Page 2 Display and Question Loading
**Expected:** Page 2 shows all survey questions dynamically

```javascript
// Playwright test steps:
1. Complete Page 1 and proceed to Page 2
2. Verify Page 2 loads with title "Market Survey Questions"
3. Check that questions load from survey_questions table
4. Verify question types are rendered correctly:
   - Text inputs
   - Number inputs
   - Dropdowns/selects
   - Radio buttons
   - Checkboxes
5. Verify "Submit Survey" button is present
```

**Success Criteria:**
- [ ] Page 2 loads with all questions
- [ ] Questions load from database dynamically
- [ ] Question types render correctly
- [ ] Form layout is clean and usable

### 4.2 Survey Question Design Verification
**Expected:** Questions match design specifications

```javascript
// Playwright test steps:
1. Verify question text matches survey_questions table
2. Check question order matches database order
3. Verify required questions are marked with *
4. Check field types match question type:
   - "text" → input[type="text"]
   - "number" → input[type="number"]
   - "select" → select dropdown
   - "radio" → radio buttons
   - "checkbox" → checkboxes
5. Verify validation rules work correctly
```

**Success Criteria:**
- [ ] Question text matches database
- [ ] Question order is correct
- [ ] Field types are accurate
- [ ] Required fields marked correctly
- [ ] Validation rules work

### 4.3 Conditional Deal Tables - Closed Deals
**Expected:** Deal table shows only if closed deals count > 0

```javascript
// Playwright test steps:
1. Find "How many closed deals?" question
2. Enter "0" in closed deals count
3. Verify closed deals table is hidden
4. Enter "3" in closed deals count
5. Verify closed deals table appears
6. Verify table has correct number of rows (3)
7. Enter "0" again
8. Verify closed deals table hides
9. Test with different numbers (1, 2, 5)
```

**Success Criteria:**
- [ ] Deal table hidden when count = 0
- [ ] Deal table shows when count > 0
- [ ] Table has correct number of rows
- [ ] Table shows/hides dynamically
- [ ] Table fields are properly labeled

### 4.4 Conditional Deal Tables - Active Deals
**Expected:** Deal table shows only if active deals count > 0

```javascript
// Playwright test steps:
1. Find "How many active deals?" question
2. Enter "0" in active deals count
3. Verify active deals table is hidden
4. Enter "2" in active deals count
5. Verify active deals table appears
6. Verify table has correct number of rows (2)
7. Enter "0" again
8. Verify active deals table hides
9. Test with different numbers (1, 4, 5)
```

**Success Criteria:**
- [ ] Active deals table hidden when count = 0
- [ ] Active deals table shows when count > 0
- [ ] Table has correct number of rows
- [ ] Table shows/hides dynamically
- [ ] Table fields are properly labeled

### 4.5 Deal Table Field Types and Validation
**Expected:** Deal table fields have correct types and validation

```javascript
// Playwright test steps:
1. Show deal tables (enter count > 0)
2. Verify field types are correct:
   - Industry: text input
   - Deal Value: number input (currency)
   - Cash at Close: number input (currency)
   - Buyer Type: select dropdown
   - Revenue: number input (currency)
   - EBITDA: number input (currency)
   - Growth Rate: number input (percentage)
   - Employees: number input (integer)
3. Test validation:
   - Required fields marked with *
   - Number fields accept only numbers
   - Currency fields format correctly
   - Percentage fields validate range
```

**Success Criteria:**
- [ ] Field types are correct
- [ ] Validation rules work
- [ ] Required fields marked
- [ ] Number formatting works
- [ ] Dropdown options are correct

### 4.6 Survey Submission and Data Persistence
**Expected:** Survey submits and data saves to correct tables

```javascript
// Playwright test steps:
1. Fill out all required fields
2. Fill out deal tables (if applicable)
3. Click "Submit Survey"
4. Verify loading state shows
5. Check browser network tab for survey-submit API call
6. Verify API call succeeds (200 response)
7. Verify redirect to /app/dashboard
8. Check database tables for data:
   - survey_responses: main response record
   - survey_non_deal_responses: user profile data
   - survey_deal_responses: deal data (if applicable)
```

**Success Criteria:**
- [ ] Survey submission API called
- [ ] API call succeeds with 200 response
- [ ] Data saved to all relevant tables
- [ ] Redirect to dashboard works
- [ ] All form data persisted correctly

---

## Phase 5: Database Data Verification

### 5.1 Survey Response Record
**Expected:** Main response record created correctly

```sql
-- Verify survey_responses table
SELECT 
  id,
  survey_id,
  user_id,
  submitted_at,
  source,
  email
FROM survey_responses 
WHERE user_id = 'authenticated_user_id'
ORDER BY created_at DESC 
LIMIT 1;
```

**Success Criteria:**
- [ ] Response record created with correct user_id
- [ ] Submitted_at timestamp is accurate
- [ ] Source field shows "web"
- [ ] Email field populated

### 5.2 User Profile Data (survey_non_deal_responses)
**Expected:** User profile data saved correctly

```sql
-- Verify survey_non_deal_responses table
SELECT 
  id,
  response_id,
  user_id,
  first_name,
  last_name,
  profession,
  us_zip_code,
  country,
  closed_deals_count,
  active_deals_count
FROM survey_non_deal_responses 
WHERE user_id = 'authenticated_user_id'
ORDER BY created_at DESC 
LIMIT 1;
```

**Success Criteria:**
- [ ] User profile data saved correctly
- [ ] All form fields populated
- [ ] Deal counts match user input
- [ ] Response_id links to survey_responses

### 5.3 Deal Data (survey_deal_responses)
**Expected:** Deal data saved correctly (if applicable)

```sql
-- Verify survey_deal_responses table
SELECT 
  id,
  response_id,
  user_id,
  deal_type,
  deal_index,
  industry,
  deal_value_usd_m,
  cash_paid_close_usd_m,
  buyer_type,
  annual_revenue_usd_m,
  adjusted_ebitda_usd_m,
  revenue_growth_rate_pct,
  number_employees
FROM survey_deal_responses 
WHERE user_id = 'authenticated_user_id'
ORDER BY created_at DESC;
```

**Success Criteria:**
- [ ] Deal records created (if count > 0)
- [ ] All deal fields populated correctly
- [ ] Deal_index increments correctly (1, 2, 3, etc.)
- [ ] Deal_type matches (closed/active)
- [ ] Response_id links to survey_responses

### 5.4 Users Table Updates
**Expected:** Users table updated with profession and other data

```sql
-- Verify users table
SELECT 
  id,
  email,
  first_name,
  last_name,
  profession,
  is_member,
  membership_level,
  created_at,
  updated_at
FROM users 
WHERE email = 'test@example.com';
```

**Success Criteria:**
- [ ] Users table updated with form data
- [ ] Profession field populated
- [ ] Membership status correct
- [ ] Updated_at timestamp reflects changes

### 5.5 HubSpot Contact Verification
**Expected:** HubSpot contact created/updated with all data

```javascript
// Verify HubSpot contact via API
1. Check HubSpot for contact with test email
2. Verify contact properties:
   - firstname: matches form submission
   - lastname: matches form submission
   - profession_am_aa: matches form submission
   - zip: matches form submission
   - country: matches form submission
   - lifecyclestage: "subscriber"
   - hs_analytics_source: "DIRECT_TRAFFIC"
3. Verify contact was created/updated after Page 1
```

**Success Criteria:**
- [ ] HubSpot contact exists
- [ ] All properties populated correctly
- [ ] Contact created after Page 1 submission
- [ ] Data matches form submission exactly

---

## Phase 6: Dashboard Testing

### 6.1 Dashboard Personalization
**URL:** `/app/dashboard`  
**Expected:** Dashboard shows personalized content

```javascript
// Playwright test steps:
1. Complete survey and land on dashboard
2. Verify welcome message shows user's email prefix
3. Check member status badge (if applicable)
4. Verify survey status shows "Completed"
5. Check all dashboard elements are present:
   - KPI cards
   - Quick links
   - Navigation
6. Verify dashboard is responsive
```

**Success Criteria:**
- [ ] Welcome message personalized
- [ ] Member status badge shows correctly
- [ ] Survey status reflects completion
- [ ] All dashboard elements present
- [ ] Dashboard is responsive

### 6.2 Dashboard Authentication Check
**Expected:** Unauthenticated users redirected to survey

```javascript
// Playwright test steps:
1. Clear localStorage (simulate logout)
2. Navigate to /app/dashboard
3. Verify redirect to /survey
4. Verify login modal appears
5. Re-authenticate
6. Verify dashboard loads correctly
```

**Success Criteria:**
- [ ] Unauthenticated users redirected
- [ ] Login modal appears
- [ ] Re-authentication works
- [ ] Dashboard loads after auth

---

## Phase 7: Edge Case Testing

### 7.1 Token Expiration Handling
**Expected:** Graceful handling of expired tokens

```javascript
// Playwright test steps:
1. Complete authentication
2. Manually expire token in localStorage
3. Try to access /survey
4. Verify redirect to login modal
5. Re-authenticate
6. Verify normal flow continues
7. Test with expired refresh token
```

**Success Criteria:**
- [ ] Expired tokens handled gracefully
- [ ] Users redirected to login
- [ ] Re-authentication works
- [ ] No broken states

### 7.2 Network Error Handling
**Expected:** Graceful failure for API errors

```javascript
// Playwright test steps:
1. Complete Page 1 form
2. Simulate network failure (dev tools)
3. Click "Next →"
4. Verify error message appears
5. Restore network
6. Verify retry works
7. Test with HubSpot API failure
```

**Success Criteria:**
- [ ] Network errors handled gracefully
- [ ] Error messages are helpful
- [ ] Retry functionality works
- [ ] No data loss

### 7.3 Survey Abandonment
**Expected:** Data saved to non_deal_responses

```javascript
// Playwright test steps:
1. Complete Page 1 form
2. Navigate away from page
3. Check database for survey_non_deal_responses record
4. Verify data is saved
5. Return to survey
6. Verify Page 1 data is restored
```

**Success Criteria:**
- [ ] Page 1 data saved on abandonment
- [ ] Data restored on return
- [ ] No data loss
- [ ] User can continue where left off

### 7.4 Form Validation Edge Cases
**Expected:** All validation scenarios work correctly

```javascript
// Playwright test steps:
1. Test with invalid email formats
2. Test with extremely long text inputs
3. Test with negative numbers where not allowed
4. Test with special characters
5. Test with empty required fields
6. Test with invalid dropdown selections
```

**Success Criteria:**
- [ ] All validation scenarios work
- [ ] Error messages are clear
- [ ] Form submission blocked appropriately
- [ ] No crashes or errors

---

## Phase 8: Cross-Browser Testing

### 8.1 Browser Compatibility
**Browsers:** Chrome, Firefox, Safari, Edge

```javascript
// Playwright test steps:
1. Test complete flow in Chrome
2. Test complete flow in Firefox
3. Test complete flow in Safari
4. Test complete flow in Edge
5. Verify consistent behavior across browsers
6. Check for any browser-specific issues
```

**Success Criteria:**
- [ ] Consistent behavior across browsers
- [ ] No browser-specific bugs
- [ ] All features work in all browsers
- [ ] Performance is acceptable

### 8.2 Mobile Responsiveness
**Devices:** iPhone, Android, Tablet

```javascript
// Playwright test steps:
1. Test on iPhone viewport (375x667)
2. Test on Android viewport (360x640)
3. Test on tablet viewport (768x1024)
4. Verify modal displays correctly
5. Verify form is usable on mobile
6. Test touch interactions
```

**Success Criteria:**
- [ ] Modal displays correctly on mobile
- [ ] Form is usable on mobile
- [ ] Touch interactions work
- [ ] No horizontal scrolling
- [ ] Text is readable

---

## Phase 9: Performance Testing

### 9.1 Load Time Testing
**Expected:** Fast page loads and smooth interactions

```javascript
// Playwright test steps:
1. Measure initial page load time
2. Measure modal open time
3. Measure form submission time
4. Measure API response times
5. Verify all interactions are smooth
6. Check for any console errors
```

**Success Criteria:**
- [ ] Page loads in < 3 seconds
- [ ] Modal opens in < 1 second
- [ ] Form submission in < 5 seconds
- [ ] No console errors
- [ ] Smooth animations

### 9.2 API Response Testing
**Expected:** Fast API responses

```javascript
// Playwright test steps:
1. Monitor API call response times
2. Verify all API calls complete successfully
3. Check for any failed requests
4. Verify error handling works
5. Test with slow network conditions
```

**Success Criteria:**
- [ ] API responses < 2 seconds
- [ ] No failed requests
- [ ] Error handling works
- [ ] Graceful degradation

---

## Phase 10: Security Testing

### 10.1 Authentication Security
**Expected:** Secure authentication flow

```javascript
// Playwright test steps:
1. Test with invalid tokens
2. Test with expired tokens
3. Test with malformed tokens
4. Verify JWT validation works
5. Test with different user contexts
6. Verify no token leakage
```

**Success Criteria:**
- [ ] Invalid tokens rejected
- [ ] Expired tokens handled
- [ ] JWT validation works
- [ ] No token leakage
- [ ] User context isolation

### 10.2 Data Security
**Expected:** Data protected and validated

```javascript
// Playwright test steps:
1. Test with malicious input
2. Test with SQL injection attempts
3. Test with XSS attempts
4. Verify data sanitization
5. Test with oversized payloads
6. Verify RLS policies work
```

**Success Criteria:**
- [ ] Malicious input sanitized
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] Data validation works
- [ ] RLS policies enforced

---

## Testing Execution Plan

### Pre-Testing Setup
1. **Clear all test data** from database
2. **Set up test email accounts** for magic link testing
3. **Configure HubSpot test contacts** for pre-population testing
4. **Set up Playwright test environment** with proper configuration
5. **Verify all Edge Functions** are deployed and active

### Testing Order
1. **Phase 1:** Environment Verification (Already Complete)
2. **Phase 2:** Authentication Flow Testing
3. **Phase 3:** Survey Page 1 Testing
4. **Phase 4:** Survey Page 2 Testing
5. **Phase 5:** Database Data Verification
6. **Phase 6:** Dashboard Testing
7. **Phase 7:** Edge Case Testing
8. **Phase 8:** Cross-Browser Testing
9. **Phase 9:** Performance Testing
10. **Phase 10:** Security Testing

### Success Criteria
- **Must Pass (Critical):** All authentication, survey flow, and data persistence tests
- **Should Pass (Important):** Cross-browser compatibility, performance, security
- **Nice to Have (Optional):** Advanced error recovery, offline functionality

### Test Data Management
- **Use consistent test data** across all tests
- **Clean up test data** after each test phase
- **Use unique identifiers** to avoid conflicts
- **Document test data** for reproducibility

### Reporting
- **Document all test results** with screenshots
- **Record any failures** with detailed steps to reproduce
- **Track performance metrics** for optimization
- **Create test report** with pass/fail status

---

## Conclusion

This comprehensive testing plan covers all aspects of the survey login modal and authentication redesign. Each phase must be completed and verified before marking any feature as complete. The plan ensures that:

1. **Authentication flow** works correctly
2. **Survey questions** load and display properly
3. **Field types** are accurate and functional
4. **Data persistence** works across all tables
5. **User experience** is smooth and intuitive
6. **System performance** meets requirements
7. **Security** is maintained throughout

**Only after all tests pass can we confirm the implementation is complete!** 🎯
