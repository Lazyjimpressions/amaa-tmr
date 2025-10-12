# Survey Logic (Scaffold for Phase 2)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-12
- **Version:** 1.1
- **Owner:** Jonathan

## Implementation Phases

### Phase 1: Basic Survey (Current)
- Single-page survey with all questions
- Authentication integration
- Auto-save draft functionality
- Completion flow with download access

### Phase 2: Conditional Logic (Future)
- Support conditional visibility/validation (branching) without hardcoding UI
- Advanced question dependencies
- Dynamic survey flow

Data model (reserved fields)
- Table: `survey_questions`
  - `code` (text): stable key (e.g., DEAL_VOLUME)
  - `type` (text): single|multi|number|text
  - `options` (jsonb)
  - `section` (text), `order` (int)
  - **`logic` (jsonb, nullable)** — branching metadata
  - **`validation` (jsonb, nullable)** — validation rules

Proposed JSON shapes
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


