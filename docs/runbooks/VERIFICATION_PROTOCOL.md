# Verification Protocol — AM&AA TMR

## Document Information
- **Created:** 2025-10-08
- **Last Updated:** 2025-10-08
- **Version:** 1.0
- **Owner:** Jonathan

## Purpose
This document establishes mandatory verification steps to prevent incorrect assumptions about system state and ensure accurate documentation updates.

## 🚨 **MANDATORY VERIFICATION STEPS**

### **Before Making ANY Claims About System State:**

#### **1. Supabase Database Verification**
```bash
# ALWAYS run these MCP commands first:
- mcp_supabase_list_tables (check schema and data)
- mcp_supabase_list_edge_functions (verify deployed functions)
- mcp_supabase_execute_sql (if needed for specific data queries)
```

#### **2. Codebase Search Verification**
```bash
# ALWAYS search for existing implementations:
- codebase_search for relevant functionality
- read_file for specific implementation files
- grep for specific patterns or configurations
```

#### **3. Frontend Testing (When Applicable)**
```bash
# ALWAYS test functionality with Playwright:
- mcp_playwright_navigate to staging site
- mcp_playwright_screenshot to verify UI state
- mcp_playwright_evaluate for JavaScript functionality
```

#### **4. Documentation Cross-Reference**
```bash
# ALWAYS check existing docs before updating:
- Read current PRD.md
- Read current IMPLEMENTATION_PLAN.md
- Read current WP_CONFORMANCE_CHECKLIST.md
- Check runbooks for current status
```

## 📋 **VERIFICATION CHECKLIST**

### **Before Updating Documentation:**
- [ ] Verified Supabase database state with MCP tools
- [ ] Verified Edge Functions deployment status
- [ ] Searched codebase for existing implementations
- [ ] Tested frontend functionality (if applicable)
- [ ] Read existing documentation to understand current state
- [ ] Asked user for clarification on any unclear points

### **Before Making Implementation Claims:**
- [ ] Confirmed actual code exists (not just documentation)
- [ ] Verified deployment status with MCP tools
- [ ] Tested functionality end-to-end
- [ ] Validated database schema and data
- [ ] Checked WordPress plugin configuration

## 🚫 **NEVER DO THESE:**

1. **NEVER assume** functions are deployed without MCP verification
2. **NEVER assume** database state without checking tables
3. **NEVER assume** frontend works without testing
4. **NEVER insert** mock data or placeholders
5. **NEVER make up** functionality that doesn't exist
6. **NEVER update** documentation without verifying current state

## ✅ **ALWAYS DO THESE:**

1. **ALWAYS use MCP tools** to verify Supabase state
2. **ALWAYS search codebase** for existing implementations
3. **ALWAYS test functionality** with Playwright when applicable
4. **ALWAYS ask for clarification** when uncertain
5. **ALWAYS verify** before documenting
6. **ALWAYS cross-reference** existing documentation

## 🔄 **DOCUMENTATION UPDATE PROTOCOL**

### **When Updating PRD.md:**
1. Read current PRD.md completely
2. Verify all claims with MCP tools and codebase search
3. Test functionality with Playwright if applicable
4. Update only verified facts
5. Mark sections with verification dates

### **When Updating IMPLEMENTATION_PLAN.md:**
1. Check current milestone status with MCP tools
2. Verify Edge Functions deployment status
3. Test WordPress functionality
4. Update only completed/verified items
5. Mark remaining items as pending verification

### **When Updating WP_CONFORMANCE_CHECKLIST.md:**
1. Test WordPress theme and plugin functionality
2. Verify Supabase integration
3. Check design system implementation
4. Update only verified completed items

## 📊 **CURRENT VERIFIED STATE (2025-10-14)**

### **Supabase Database:**
- ✅ 7 tables with RLS: members, surveys, survey_questions, survey_responses, survey_answers, ai_briefs, question_embeddings
- ✅ 6 members in database
- ✅ 2 surveys with 5 questions
- ✅ 2 survey responses with 10 answers
- ✅ Email column added to survey_responses table for anonymous tracking

### **Edge Functions:**
- ✅ 14 functions deployed (including core + additional webhook handlers)
- ✅ Core functions: me, survey-submit, hubspot-contact-upsert, data-query-charts, ai-generate-brief, import-winter-2025, survey-save-draft
- ✅ Additional functions: check-membership, survey-submit-public, survey-save-public, hubspot-auth, hubspot-email-lookup, auth-callback
- ✅ JWT verification settings properly configured (verify_jwt: false for public functions)

### **WordPress:**
- ✅ Complete theme with app shell and marketing templates
- ✅ Supabase Bridge Plugin with admin settings and shortcodes
- ✅ Survey system with React-like components and HubSpot integration
- ✅ Design system fully implemented
- ✅ Multi-page survey with single button UX working correctly
- ✅ HubSpot integration with form prepopulation using profession_am_aa field

### **Survey Authentication Flow:**
- ✅ Fixed two-button issue (was component architecture problem, not caching)
- ✅ Single button UX: "Send Magic Link" when not authenticated, "Next" when authenticated
- ✅ HubSpot lookup working with form prepopulation
- ✅ Magic link sending functionality implemented
- 🔄 Magic link callback and auto-advance to Page 2 (pending testing)
- 🔄 Header login state update (pending implementation)

## 🎯 **NEXT VERIFICATION STEPS**

1. **Test survey functionality** with Playwright
2. **Verify WordPress plugin configuration**
3. **Test HubSpot integration**
4. **Validate end-to-end user flows**

---

**Remember: When in doubt, VERIFY first, document second, ask questions always.**
