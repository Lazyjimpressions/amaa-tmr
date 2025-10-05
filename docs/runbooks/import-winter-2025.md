# Runbook — Import "Market Survey Winter 2025"

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

## Files (partial examples provided)
- Field key: `Market_Survey_Winter_25_fieldkey_partial.csv`
- Responses: `Market_Survey_Responses_Winter_25_partial.csv`
- Format: single flat CSV; one row per respondent; repeated "deal" columns (1..N)

## Header normalization
- Trim; lowercase; spaces→underscore; remove special chars

## Minimum required metadata
- Respondent ID (or deterministic hash inputs)
- Submission Date/End_Date
- Profession (if available)
- At least one deal indicator or explicit closed_deals

## Mapping (examples from field key)
- `profession` → respondent role
- `closed_deals` → number of deals
- `closed_industry_1` → industry (Deal 1)
- `closed_cashprice_1` → cash at close $M (Deal 1)
- `closed_escrow_1` → escrow $M (Deal 1)
- `closed_note_amt_1` → note amount $M (Deal 1)
- `closed_note_interest_1` → note interest % (Deal 1)
- `closed_note_term_1` → note term years (Deal 1)
- `closed_equitystock_1` → rolled equity/stock $M (Deal 1)
- `closed_earnout_1` → earnout $M (Deal 1)
- `closed_annrev_1` → annual revenue $M (Deal 1)
- `closed_ebitda_1` → adj EBITDA $M (Deal 1)
- ... repeat for `_2`, `_3`, etc.

## Importer EF: `import-winter-2025` (admin only)
- Input: `multipart/form-data` CSV or presigned URL
- Steps:
  1) Normalize headers
  2) Validate required cols
  3) Ensure `surveys.slug = '2025-winter'`
  4) For each row: insert `survey_responses` (`source='import'`); for each mapped field, insert `survey_answers`
  5) Idempotency using `respondent_hash = sha256(email|ip|submitted_at|slug)`
  6) Return counts + error list

## Post-import sanity
- Response count vs CSV rows (after exclusions)
- 3 respondent spot-checks (multi-deal case included)
- charts stub returns non-empty data