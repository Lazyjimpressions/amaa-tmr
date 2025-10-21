
# AM&AA TMR Summer 2025 Market Survey - Master Reference

## Survey Overview
- **Survey Period**: Summer 2025 (January 31 - June 30, 2025)
- **Target Audience**: M&A professionals, investment bankers, private equity, business brokers
- **Total Questions**: 32
- **Sections**: 4 main sections
- **Database Tables**: `survey_deal_responses`, `survey_non_deal_responses`

---

## Section 1: Basic User Information (Questions 1-3)

### Question 1: Contact Information
- **Text**: "Contact Info: Required to receive a free copy (for AM&AA members) or discount (for non-members) of the final report. We will not sell or provide your contact info to others."
- **Type**: `text` (3 fields)
- **Fields**: 
  - `first_name` (text)
  - `last_name` (text) 
  - `email` (email)
- **Required**: Yes
- **Database**: `survey_non_deal_responses`

### Question 2: Location
- **Text**: "Where is your firm located? Or your office if your firm has multiple offices"
- **Type**: `text` + `select`
- **Fields**:
  - `us_zip_code` (text) - "United States Zip Code"
  - `country` (select) - "If outside of US, enter name of COUNTRY"
- **Options**: Country dropdown (US, Canada, UK, etc.)
- **Required**: Yes
- **Database**: `survey_non_deal_responses`

### Question 3: Profession
- **Text**: "Which of the following best describes your profession?"
- **Type**: `select`
- **Options**: 
  - Accountant / Financial Services
  - Attorney
  - Business Broker
  - Business Valuator
  - Value Growth Advisor / Mgmt. Consultant
  - Investment Banker / M&A Intermediary
  - Deal Analyst / Deal Support
  - Corporate Business Development
  - Private Equity (Investor)
  - Independent Sponsor (Investor)
  - Family/Home Office Advisor (Investor)
  - Commercial / Senior Lender
  - Secondary / Mezzanine Lender
  - Wealth Manager / Financial Advisor
  - Other (Please specify)
- **Required**: Yes
- **Database**: `survey_non_deal_responses`

---

## Section 2: Deal-Specific Data (Questions 4-20)

### Question 4: Closed Deals Count
- **Text**: "How many deals did you work on that CLOSED or will close by the end of June 2025?"
- **Type**: `number`
- **Field**: `closed_deals_count`
- **Required**: Yes
- **Database**: `survey_non_deal_responses`

### Question 5: Closed Deal Details
- **Text**: "Describe the deals you worked on that CLOSED or will close by the end of June 2025. Enter your answers in Millions (Example: $10,500,000 is entered as 10.5)"
- **Type**: `deal_table`
- **Rows**: 5 static rows
- **Fields**: All deal table fields (industry, deal_value, cash_paid, etc.)
- **Required**: Yes
- **Database**: `survey_deal_responses` (deal_type = 'closed')

### Question 6: Success Fee Matrix
- **Text**: "What was the average final success fee/commission for the Sell-Side deal broker for deals closed in the first half of 2025 for the following deal sizes?"
- **Type**: `matrix`
- **Deal Size Ranges**: 13 ranges (Under $1M to $200M+)
- **Options**: N/A, 0%, 0.5%, 1%, 1.5%, 2%, 3%, 4%, 5%, 6%, 7%, 8%, 9%, 10%, 11%, 12%, More than 12%
- **Database**: `survey_non_deal_responses` (success_fee_* fields)

### Question 7: Retainer Fee Matrix
- **Text**: "What is the average retainer fee for the Sell-Side deal broker for deals closed in the first half of 2025 for the following deal sizes?"
- **Type**: `matrix`
- **Deal Size Ranges**: 13 ranges (Under $1M to $200M+)
- **Options**: N/A, <$5K, $5K-$9.9K, $10K-$19.9K, $20K-$29.9K, $30K-$49.9K, $50K-$99.9K, $100K-$199K, >$200K
- **Database**: `survey_non_deal_responses` (retainer_fee_* fields)

### Question 8: Post-Close Compensation
- **Text**: "How often was Post-Close Salary/Compensation included in deals that closed in the first-half of 2025?"
- **Type**: `select`
- **Options**: 0%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%, 100%
- **Field**: `post_close_salary_pct`
- **Database**: `survey_non_deal_responses`

### Question 9: Terminated/Suspended Deals
- **Text**: "How many deals did you work on that TERMINATED or SUSPENDED in the first-half of 2025?"
- **Type**: `number`
- **Field**: `terminated_suspended_deals_count`
- **Database**: `survey_non_deal_responses`

### Question 10: Importance Factors
- **Text**: "In the first-half of 2025, how important were the following factors in getting deals under LOI?"
- **Type**: `radio_array`
- **Factors**: 12 factors (Revenue Consistency, EBITDA Margin, Revenue Growth, etc.)
- **Options**: Lowest, Low, Medium, High, Highest
- **Database**: `survey_non_deal_responses` (*_importance fields)

### Question 11: Negotiation Trends
- **Text**: "In the first-half of 2025, what negotiations trends did your firm need to use to close deals?"
- **Type**: `radio_array`
- **Factors**: 6 factors (Total Consideration, Cash at Close, Stock/Rolled Equity, Note Payment, Earnout, Post-Close Compensation)
- **Options**: Significant Decrease, Somewhat Decrease, No Change, Somewhat Increase, Significant Increase
- **Database**: `survey_non_deal_responses` (*_trend fields)

### Question 12: Active Deals Count
- **Text**: "How many ACTIVE deals is your firm currently working on?"
- **Type**: `number`
- **Field**: `active_deals_count`
- **Database**: `survey_non_deal_responses`

### Question 13: Prospective Deals Count
- **Text**: "How many tangible prospective, but not yet retained, deal/client opportunities do you currently have?"
- **Type**: `number`
- **Field**: `prospective_deals_count`
- **Database**: `survey_non_deal_responses`

### Question 14: Active Deal Details
- **Text**: "Describe your current ACTIVE DEALS UNDER LOI that you expect to close in 2025. Enter your answers in Millions"
- **Type**: `deal_table`
- **Rows**: 5 static rows
- **Fields**: All deal table fields
- **Required**: Yes
- **Database**: `survey_deal_responses` (deal_type = 'active')

### Question 15: Client Impact Factors
- **Text**: "How are your active deal clients impacted by the following factors? Select one answer for each row."
- **Type**: `radio_array`
- **Factors**: 10 factors (Interest rate changes, Lending environment, Supply chain issues, Labor shortages, etc.)
- **Options**: Strong Negative Impact, Somewhat Negative Impact, Neutral/No Impact, Somewhat Positive Impact, Strong Positive Impact
- **Database**: `survey_non_deal_responses` (*_impact fields)

### Question 16: Seller Motivation
- **Text**: "What is motivating current Sellers to pursue a transaction?"
- **Type**: `multi_select`
- **Options**: 9 options (Personal factors, Burnout, Company performance, Age/Retirement, etc.)
- **Database**: `survey_non_deal_responses` (*_motivation fields)

### Question 17: Seller Wants
- **Text**: "What do current Sellers want out of the transaction?"
- **Type**: `radio_array`
- **Factors**: 7 factors (Cash at close, Total sale price, Closing speed, etc.)
- **Options**: Least Important, Less Important, Neutral, More Important, Most Important
- **Database**: `survey_non_deal_responses` (*_importance fields)

### Question 18: Seller Advice
- **Text**: "For Sell-side deal work, what advice is your firm giving prospective sellers who want to sell soon?"
- **Type**: `multi_select`
- **Options**: 4 options (Wait and see, Start process, Prepare for sale, Restructure/improve)
- **Database**: `survey_non_deal_responses` (*_advice fields)

### Question 19: Buy-side Activities
- **Text**: "For Buy-side deal work, what are the main activities your firm is pursuing now?"
- **Type**: `multi_select`
- **Options**: 4 options (Wait and see, Passive evaluation, Actively pursuing, Restructure portfolio)
- **Database**: `survey_non_deal_responses` (*_pursuing fields)

---

## Section 3: Predictions and Outlook (Questions 20-29)

### Question 20: Total Deals 2025
- **Text**: "How many total deals do you expect your firm to close for ALL of 2025?"
- **Type**: `number`
- **Field**: `expected_total_deals_2025` (calculated field)
- **Database**: `survey_non_deal_responses`

### Question 21: Dealflow Impact Factors
- **Text**: "How much do you think the following factors will impact dealflow in the second-half of 2025?"
- **Type**: `radio_array`
- **Factors**: 6 factors (Economic outlook, Seller motivation, Buyer motivation, Interest rates, Lending environment, Seller financial performance)
- **Options**: Strong Negative Impact, Somewhat Negative Impact, Neutral/No Impact, Somewhat Positive Impact, Strong Positive Impact
- **Database**: `survey_non_deal_responses` (*_dealflow_impact fields)

### Question 22: Tariff Financial Impact
- **Text**: "How are the newly enacted or anticipated tariffs and trade policies impacting the financial performance of the companies of your current prospects and clients?"
- **Type**: `number` (count-based)
- **Fields**: Multiple count fields for different impact levels
- **Database**: `survey_non_deal_responses` (*_count fields)

### Question 23: Tariff Deal Impact
- **Text**: "How are the newly enacted or anticipated tariffs and trade policies impacting your current and prospective deals?"
- **Type**: `number` (count-based)
- **Fields**: Multiple count fields for different scenarios
- **Database**: `survey_non_deal_responses` (*_count fields)

### Question 24: Tariff Policy Results
- **Text**: "What do you believe will be the results of the tariff and trade policies over the next few years?"
- **Type**: `multi_select`
- **Options**: 10 options (Policies will largely take effect, be walked back, increased, etc.)
- **Database**: `survey_non_deal_responses` (*_result fields)

### Question 25: Government Layoff Results
- **Text**: "What do you believe will be the results of the recent government layoffs, budget cuts, and contract cancellations over the next few years?"
- **Type**: `multi_select`
- **Options**: 10 options (Layoffs will largely remain, be walked back, increased, etc.)
- **Database**: `survey_non_deal_responses` (*_result fields)

### Question 26: Economic Environment
- **Text**: "What will be the upcoming economic environment (impacting the businesses for sale in your deals) for the second half of 2025?"
- **Type**: `select`
- **Options**: Very favorable, Somewhat favorable, Neutral, Somewhat unfavorable, Very unfavorable
- **Field**: `economic_environment_second_half_2025`
- **Database**: `survey_non_deal_responses`

### Question 27: EBITDA Multiples Projection
- **Text**: "Where do you think Average EBITDA MULTIPLES will be at the end of 2025 relative to now?"
- **Type**: `select`
- **Options**: Down by more than 1x EBITDA, Down by ~1x EBITDA, Down by ~0.5x EBITDA, About the same, Up by ~0.5x EBITDA, Up by ~1x EBITDA, Up by more than 1x EBITDA
- **Field**: `ebitda_multiples_end_2025`
- **Database**: `survey_non_deal_responses`

### Question 28: Deal Activity Volume Projection
- **Text**: "Where do you think Deal Activity Volume will be at the end of 2025 relative to now?"
- **Type**: `select`
- **Options**: Significantly Decreased, Somewhat Decreased, No Change, Somewhat Increased, Significantly Increased
- **Field**: `deal_activity_volume_end_2025`
- **Database**: `survey_non_deal_responses`

### Question 29: Second-half Challenges
- **Text**: "What challenges will your firm face in the second-half of 2025?"
- **Type**: `multi_select`
- **Options**: 6 options (Limited capacity, Need additional staff, Need to reduce staff, Finding qualified targets, Retaining clients, Market headwinds)
- **Database**: `survey_non_deal_responses` (*_challenge fields)

---

## Section 4: Survey Value Assessment (Questions 30-32)

### Question 30: Survey Value Assessment
- **Text**: "Has the report and survey data provided value to you, and if so, how?"
- **Type**: `multi_select`
- **Options**: 6 options (Winning new clients, Informing existing clients, Communicating valuations, Staying informed, Marketing materials, Not used previously)
- **Database**: `survey_non_deal_responses` (*_value fields)

### Question 31: Survey Value Rating
- **Text**: "Overall, please rate the value you derive from our semi-annual Market Survey."
- **Type**: `rating` (0-10 scale)
- **Field**: `survey_value_rating`
- **Database**: `survey_non_deal_responses`

### Question 32: Membership Interest
- **Text**: "Are you interested in learning more about AM&AA membership?"
- **Type**: `radio`
- **Options**: Yes, No, N/A - I am already an AM&AA member
- **Field**: `amaa_membership_interest`
- **Database**: `survey_non_deal_responses`

---

## Implementation Status

### ✅ Completed
- [x] Question numbering system
- [x] Deal table component (5-row approach)
- [x] Matrix question component (success/retainer fees)
- [x] Radio array component (sentiment arrays)
- [x] Multi-select component
- [x] Basic styling and responsive design
- [x] All missing questions added to database (Q6, Q7, Q9, Q10, Q11, Q13, Q15-Q19, Q21-Q26, Q29-Q30)
- [x] Individual fields approach confirmed for historical data compatibility
- [x] Question 20 moved to Section 3 (Predictions and Outlook)
- [x] Field_Key_SC25 mapping table created with 159 field mappings
- [x] Placeholder questions cleaned up (removed high order numbers)
- [x] Duplicate questions removed (kept Q-coded versions)

### 🔄 In Progress
- [ ] Database field verification
- [ ] Edge function updates for new question types

### 📋 Next Steps
1. Verify all database fields are captured in tables
2. Test complete survey flow with new components
3. Test historical data import with new schema
4. Deploy and test with sample data
5. Implement period-based question filtering

---

## Current Status Summary

### ✅ **COMPLETED TASKS**
1. **Survey Questions**: All 30 questions properly structured and added to database
2. **Question Types**: All question types implemented (text, number, select, radio, checkbox, deal_table, matrix, radio_array, multi_select)
3. **Database Schema**: Individual fields approach confirmed for historical compatibility
4. **Field Mapping**: Complete Field_Key_SC25 table with 159 field mappings
5. **Data Cleanup**: Removed placeholder and duplicate questions
6. **Question Numbering**: Proper question order (1-30) with numbering display
7. **Component Development**: Deal table, matrix, radio array, and multi-select components

### 🔄 **IN PROGRESS**
1. **Database Field Verification**: Ensure all response fields exist in tables
2. **Edge Function Updates**: Update functions to handle new question types

### 📋 **IMMEDIATE NEXT STEPS**
1. **Verify Database Fields**: Check that all 151 fields exist in `survey_non_deal_responses` table
2. **Test Survey Flow**: Verify all question types render correctly in frontend
3. **Historical Data Import**: Test CSV import with new schema structure
4. **Edge Function Testing**: Ensure survey-submit and survey-save-draft handle new question types
5. **Period-based Filtering**: Implement dynamic question display based on survey period

### 🎯 **SUCCESS METRICS**
- ✅ All 30 questions mapped to database fields
- ✅ 159 individual field mappings created
- ✅ Historical data compatibility confirmed
- ✅ Question numbering system implemented
- ✅ All question types supported

---

## Database Schema Reference

### survey_deal_responses
- **Purpose**: Individual deal details (closed and active)
- **Key Fields**: industry, total_consideration_ev_usd_m, cash_paid_close_usd_m, etc.
- **Deal Types**: 'closed' (H1 2025), 'active' (H2 2025)

### survey_non_deal_responses  
- **Purpose**: All non-deal specific responses
- **Key Fields**: All matrix data, sentiment arrays, counts, ratings
- **Matrix Fields**: success_fee_*, retainer_fee_* (13 deal size ranges each)

### Field_Key_SC25
- **Purpose**: Mapping between survey questions and database fields
- **Status**: ✅ Complete with 159 field mappings
- **Usage**: Historical data import and field validation
- **Coverage**: All 30 questions with individual field mappings
- **Database Tables**: users (6), survey_deal_responses (2), survey_non_deal_responses (151)