# Database Integration — AM&AA TMR Survey

## Document Information
- **Created:** 2025-10-12
- **Last Updated:** 2025-10-12
- **Version:** 1.0
- **Owner:** Jonathan

## Overview

The AM&AA TMR survey uses a specialized database schema with two main response tables to capture both general survey data and detailed deal information. This document outlines the integration between the multi-page survey and the Supabase database.

## Database Schema

### Core Tables
- **`surveys`** - Survey containers (e.g., '2025-summer')
- **`survey_questions`** - Question definitions with versioning
- **`survey_responses`** - Response containers (one per user per survey)
- **`survey_answers`** - Individual question answers (legacy format)

### Specialized Response Tables

#### `survey_non_deal_responses`
**Purpose**: Captures general survey data, user profile, and market sentiment questions.

**Key Fields**:
- `response_id` - Links to survey_responses
- `question_code` - Stable question identifier
- `response_type` - Type of response (e.g., 'user_profile', 'market_sentiment')
- `first_name`, `last_name`, `email` - User profile data
- `us_zip_code`, `country`, `profession` - Location and professional data
- `closed_deals_count`, `active_deals_count` - Deal counts
- `economic_environment_second_half_2025` - Market predictions
- `survey_value_rating` - Survey value assessment (0-10)
- `amaa_membership_interest` - Membership interest

#### `survey_deal_responses`
**Purpose**: Captures individual deal data (up to 5 deals per respondent).

**Key Fields**:
- `response_id` - Links to survey_responses
- `question_code` - Stable question identifier
- `response_type` - Type of response (e.g., 'closed_deal', 'active_deal')
- `deal_index` - Deal number (1-5)
- `total_consideration_ev_usd_m` - Deal size in millions USD
- `industry`, `sub_industry` - Industry classification
- `buyer_type` - Type of buyer (Corporate, PE, etc.)
- `sell_side_success_fee_pct` - Success fee percentage
- `sell_side_retainer_fee_usd_m` - Retainer fee in millions USD
- `deal_period` - 'closed_first_half_2025' or 'active_second_half_2025'
- `deal_status` - 'closed' or 'open'

## Survey Page Integration

### Page 1: User Profile → `survey_non_deal_responses`
**Fields Mapped**:
- Email, first name, last name
- US zip code or country
- Profession
- Magic link authentication

**Data Flow**:
```
User Profile Form → handlePageSave('user_profile', data) → survey-save-draft → survey_non_deal_responses
```

### Page 2: Closed Deals → `survey_deal_responses`
**Fields Mapped**:
- Deal count → `closed_deals_count` in non_deal_responses
- Individual deal details → Multiple rows in `survey_deal_responses`
- Financial metrics → Success fees, retainer fees, post-close compensation

**Data Flow**:
```
Deal Table → handleDealChange(index, field, value) → survey-save-draft → survey_deal_responses
```

### Page 3: Active Deals → `survey_deal_responses`
**Fields Mapped**:
- Active deals count → `active_deals_count` in non_deal_responses
- Individual active deal details → Multiple rows in `survey_deal_responses`
- Market factors impact → Various impact fields in non_deal_responses
- Seller motivations → Boolean fields in non_deal_responses

### Page 4: Looking Ahead → `survey_non_deal_responses`
**Fields Mapped**:
- Total expected deals → `expected_total_deals_2025` (auto-calculated)
- Dealflow impact factors → Various impact fields
- Economic environment → `economic_environment_second_half_2025`
- EBITDA multiples prediction → `ebitda_multiples_end_2025`
- Deal activity prediction → `deal_activity_volume_end_2025`
- Challenges → Various challenge boolean fields

### Page 5: About You → `survey_non_deal_responses`
**Fields Mapped**:
- Survey value assessment → Various value boolean fields
- Overall survey rating → `survey_value_rating` (0-10)
- Membership interest → `amaa_membership_interest`

## Edge Function Integration

### `survey-save-draft` Function
**Purpose**: Saves survey data to appropriate tables based on response type.

**Parameters**:
```json
{
  "survey_id": "uuid",
  "response_id": "uuid", 
  "page": "user_profile|closed_deals|active_deals|looking_ahead|about_you",
  "data": {
    // Page-specific data
  }
}
```

**Logic**:
- **User Profile**: Save to `survey_non_deal_responses`
- **Deal Data**: Save to `survey_deal_responses` (one row per deal)
- **Market Data**: Save to `survey_non_deal_responses`

### `survey-submit` Function
**Purpose**: Final submission of complete survey.

**Process**:
1. Validate all required fields
2. Update `survey_responses.submitted_at`
3. Trigger HubSpot sync
4. Generate AI brief (if requested)

## Data Validation

### Required Fields
- **User Profile**: Email, first name, last name, location, profession
- **Deal Data**: Deal size, industry, transaction type for each deal
- **Market Data**: Economic environment, market predictions

### Business Rules
- Maximum 5 deals per respondent
- Deal size must be positive
- Success fees capped at 10%
- Retainer fees capped at $100M
- Survey rating 0-10 scale

## Authentication & Security

### Row Level Security (RLS)
- Users can only access their own responses
- Edge Functions use service role to bypass RLS
- Magic link authentication required for data access

### Data Privacy
- No PII exposed to client-side code
- All data operations through Edge Functions
- HubSpot sync for membership verification

## Performance Considerations

### Indexing
- `survey_responses.user_id` - User lookup
- `survey_deal_responses.response_id` - Deal data lookup
- `survey_non_deal_responses.response_id` - General data lookup

### Caching
- Survey questions cached in Edge Functions
- User authentication tokens cached client-side
- Response data cached during survey session

## Monitoring & Analytics

### Key Metrics
- Survey completion rate
- Page abandonment points
- Data quality metrics
- Authentication success rate

### Error Handling
- Network failures → Retry with exponential backoff
- Validation errors → Clear error messages
- Authentication failures → Redirect to login

## Future Enhancements

### Phase 2 Features
- Conditional logic based on previous answers
- Dynamic question generation
- Advanced analytics and reporting
- PDF report generation

### Scalability
- Horizontal scaling for Edge Functions
- Database partitioning for large datasets
- CDN integration for static assets
