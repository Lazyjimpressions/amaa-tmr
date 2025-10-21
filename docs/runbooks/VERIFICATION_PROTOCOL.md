# Verification Protocol

## Status Reporting Rules
- Use "🔧 Investigating..." for debug work
- Use "🔍 Testing..." for verification work  
- Use "✅ Confirmed working" only after end-to-end verification
- Use "❌ Issue identified" when problems are found
- NEVER use completion language without verification

## Change Verification Checklist
Before claiming any task complete:
- [ ] Changes committed to git
- [ ] Functionality tested end-to-end
- [ ] Original issue resolved
- [ ] No new issues introduced
- [ ] User can verify the fix works

## Git Status Verification
- [ ] Check `git status` before making claims
- [ ] Verify changes are committed, not just staged
- [ ] Confirm changes are pushed to remote if needed

## Database Verification
- [ ] Use MCP Supabase tools to verify database state
- [ ] Check table schemas match expectations
- [ ] Verify data exists where expected
- [ ] Test queries return expected results

## Frontend Verification
- [ ] Use Playwright to test actual user experience
- [ ] Verify all required elements are visible
- [ ] Test form submissions work
- [ ] Check for JavaScript errors in console

## API Verification
- [ ] Test Edge Functions with actual requests
- [ ] Verify response formats match expectations
- [ ] Check error handling works correctly
- [ ] Confirm authentication works

## Documentation Verification
- [ ] Read existing docs before making changes
- [ ] Update docs to reflect actual state
- [ ] Verify examples work as documented
- [ ] Check for outdated information

## Common Mistakes to Avoid
- ❌ Claiming "fixed" when only added debug logging
- ❌ Assuming changes are live without checking git status
- ❌ Making sweeping conclusions without systematic testing
- ❌ Confusing diagnostic work with actual problem resolution
- ❌ Using completion language without verification