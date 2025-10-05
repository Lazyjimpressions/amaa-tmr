# Survey Logic (Scaffold for Phase 2)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

Goal
- Support conditional visibility/validation (branching) without hardcoding UI.

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


