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
- **`me`** - User context and membership check (updated to use `users` table with `profession` field)
- **`survey-submit`** - Survey submission handler
- **`check-membership`** - HubSpot membership lookup (updated to remove minimal contact creation)
- **`hubspot-contact-create`** - Full HubSpot contact creation/update after Page 1 submission (NEW)

### Supporting Functions
- **`data-query-charts`** - Chart data queries (stub for MVP)
- **`ai-generate-brief`** - AI brief generation (stub for MVP)
- **`import-winter-2025`** - CSV import for Winter 2025 data
- **`survey-save-draft`** - Draft saving functionality
- **`survey-save-public`** - Anonymous survey data save
- **`hubspot-contact-upsert`** - HubSpot membership sync (legacy)

## Database Schema Updates

- **`users` table** (renamed from `members`) now includes `profession` column
- **`profession`** field synced from HubSpot `profession_am_aa` property
- All functions updated to use `users` table instead of `members`

## Deployment Status

All functions are currently **ACTIVE** and deployed to Supabase:
- Project: `ffgjqlmulaqtfopgwenf`
- All functions have JWT verification enabled
- Functions are accessible via: `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/{function-name}`

## Function Endpoints

- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/me`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-submit`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/check-membership`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/hubspot-contact-create`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/hubspot-contact-upsert`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/data-query-charts`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/ai-generate-brief`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/import-winter-2025`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-draft`
- `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/survey-save-public`

## Recent Updates (2025-10-22)

### Authentication Flow Changes
- **Modal-first authentication** - No more anonymous survey start
- **LoginModal component** - Reusable React component for authentication
- **Header integration** - Global login modal for header "Log In" button

### HubSpot Integration Changes
- **No minimal contact creation** during email lookup
- **Full contact creation** only after Page 1 submission with complete profile data
- **Profession field** synced from HubSpot to users table

### Survey Structure Changes
- **2-page survey** - User Profile (Page 1) + All Questions (Page 2)
- **Email as read-only** - Shows as verified text with badge
- **Conditional deal tables** - Show only if user enters >0 deals
- **Dashboard redirect** - After survey completion

## Development Notes

- All functions include proper error handling
- JWT verification is enabled for all functions except `hubspot-contact-upsert`
- Functions use the Supabase client with service role permissions
- MVP functions include stub data where appropriate
- Real implementations will be added in Phase 2

## Testing

Each function can be tested using the Supabase dashboard or via direct HTTP calls with proper authentication headers.
