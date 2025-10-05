# Supabase Edge Functions

This directory contains all Edge Functions for the AM&AA TMR project.

## Shared Utilities

The `_shared/utils.ts` file provides common utilities used across all functions:

- **CORS handling**: `cors()`, `ok()`, `bad()`, `created()`
- **Supabase client**: `service()`, `getUser()`
- **Data processing**: `json()`, `lower()`, `normalizeHeader()`
- **HubSpot integration**: `isActiveMemberFromHubSpot()`
- **CSV processing**: `parseCsv()`, `readCsvFromRequest()`
- **Security**: `requireAdmin()`, `sha256Hex()`

## Functions Overview

### Core Functions
- **`me`** - User context and membership check
- **`survey-submit`** - Survey submission handler
- **`hubspot-contact-upsert`** - HubSpot membership sync

### Supporting Functions
- **`data-query-charts`** - Chart data queries (stub for MVP)
- **`ai-generate-brief`** - AI brief generation (stub for MVP)
- **`import-winter-2025`** - CSV import for Winter 2025 data
- **`survey-save-draft`** - Draft saving functionality

## Deployment Status

All functions are currently **ACTIVE** and deployed to Supabase:
- Project: `ffgjqlmulaqtfopgwenf`
- All functions have JWT verification enabled
- Functions are accessible via: `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/{function-name}`

## Function Endpoints

- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-submit`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/hubspot-contact-upsert`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/data-query-charts`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/ai-generate-brief`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/import-winter-2025`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-draft`

## Development Notes

- All functions include proper error handling
- JWT verification is enabled for all functions except `hubspot-contact-upsert`
- Functions use the Supabase client with service role permissions
- MVP functions include stub data where appropriate
- Real implementations will be added in Phase 2

## Testing

Each function can be tested using the Supabase dashboard or via direct HTTP calls with proper authentication headers.
