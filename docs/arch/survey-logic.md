# Survey Logic & Database Integration

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-12
- **Version:** 2.0
- **Owner:** Jonathan

## Database Schema Overview

### Core Tables
- **`surveys`** - Survey containers (e.g., '2025-summer')
- **`survey_questions`** - Question definitions with versioning
- **`survey_responses`** - Response containers (one per user per survey)
- **`survey_answers`** - Individual question answers (legacy format)

### Specialized Response Tables
- **`survey_non_deal_responses`** - General survey data (user profile, market sentiment)
- **`survey_deal_responses`** - Individual deal data (up to 5 deals per respondent)

## Survey Page Integration

### Multi-Page Survey Structure
1. **Page 1: User Profile** → `survey_non_deal_responses`
   - Email, name, location, profession
   - Magic link authentication
   - HubSpot data prepopulation

2. **Page 2: Closed Deals** → `survey_deal_responses`
   - Deal count and individual deal details
   - Financial metrics (success fees, retainer fees)
   - Dynamic table with inline editing

3. **Page 3: Active Deals** → `survey_deal_responses`
   - Active deals count and details
   - Market factors impact
   - Seller motivations

4. **Page 4: Looking Ahead** → `survey_non_deal_responses`
   - Market predictions and challenges
   - Economic environment outlook

5. **Page 5: About You** → `survey_non_deal_responses`
   - Survey value assessment
   - Membership interest

### Data Flow
```
Survey Form → React Components → Edge Functions → Supabase Tables
     ↓              ↓                    ↓              ↓
Page 1-5 → handlePageSave() → survey-save-draft → survey_non_deal_responses
     ↓              ↓                    ↓              ↓
Deal Data → handleDealChange() → survey-save-draft → survey_deal_responses
```

## Implementation Phases

### Phase 1: Multi-Page Survey (Current)
- ✅ **Page Structure**: 5-page survey with progress tracking
- ✅ **Authentication**: Magic link integration with Supabase
- ✅ **Deal Tables**: Dynamic inline editing for deal data
- ✅ **Form Validation**: Real-time validation and error handling
- 🔄 **Save Functionality**: CORS issues with Edge Functions

### Phase 2: Conditional Logic (Future)
- Support conditional visibility/validation (branching) without hardcoding UI
- Advanced question dependencies
- Dynamic survey flow

### Data Model (Reserved Fields)
- Table: `survey_questions`
  - `code` (text): stable key (e.g., DEAL_VOLUME)
  - `type` (text): single|multi|number|text
  - `options` (jsonb)
  - `section` (text), `order` (int)
  - **`logic` (jsonb, nullable)** — branching metadata
  - **`validation` (jsonb, nullable)** — validation rules

### Proposed JSON Shapes
```json
{
  "visible_when": {
    "all": [
      { "question": "PROFESSION", "op": "in", "value": ["Buyer","Intermediary"] },
      { "question": "CLOSED_DEALS", "op": "gte", "value": 1 }
    ],
    "any": []
  },
  "disable_when": {
    "any": [
      { "question": "HAS_NDA", "op": "eq", "value": true }
    ]
  }
}


