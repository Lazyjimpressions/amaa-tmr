# Supabase Configuration Reference

**Project:** AM&AA TMR
**Project ID:** ffgjqlmulaqtfopgwenf
**Project URL:** https://ffgjqlmulaqtfopgwenf.supabase.co
**Dashboard:** https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf
**Last Updated:** October 7, 2025

---

## MCP Server Configuration

### Current Setup

The project uses Supabase's hosted MCP server with OAuth authentication.

**Configuration:** [`.cursor/mcp.json`](.cursor/mcp.json)

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?read_only=true&project_ref=ffgjqlmulaqtfopgwenf"
    }
  }
}
```

**Features:**
- Read-only mode enabled for safety
- Scoped to project `ffgjqlmulaqtfopgwenf`
- OAuth authentication (no manual tokens)
- Restart Cursor to authenticate

**Security:**
- ✅ Read-only mode for development
- ✅ Project scoping via `project_ref`
- ⚠️ Never connect to production
- ⚠️ Enable manual tool approval in Cursor settings

---

## API Keys

### Publishable Keys (`sb_publishable_...`)

**Purpose:** Client-side authentication

**Current Key:** <set in environment/Secrets> (do not commit)

**Characteristics:**
- Safe to expose publicly
- Respects Row Level Security (RLS)
- Used in frontend code, mobile apps

**Use Cases:**
- WordPress frontend JavaScript
- Mobile applications
- Public-facing components

**Best Practices:**
- Enable RLS on all tables
- Review RLS policies regularly
- Can commit to source control

### Secret Keys (`sb_secret_...`)

**Purpose:** Backend/server-side operations

**Current Key:** <set in environment/Secrets> (Name: "default")

**Characteristics:**
- Must be kept confidential
- Bypasses Row Level Security
- Full database access
- Server-side only

**Use Cases:**
- Edge Functions
- Backend microservices
- Administrative tasks
- Server-side API routes

**Security Requirements:**
- ❌ Never expose publicly
- ❌ Never commit to source control
- ✅ Store as environment variables
- ✅ Rotate if compromised
- ✅ Separate keys per environment

### Key Usage Reference

| Scenario | Key Type |
|----------|----------|
| WordPress frontend JavaScript | Publishable |
| WordPress PHP backend | Secret |
| Mobile app | Publishable |
| Edge Functions | Secret |
| Admin operations | Secret |

---

## Database Schema

### Tables (from `/supabase/sql/001_init.sql`)

**Survey System:**
- `surveys` - Survey definitions (slug, title, year, status)
- `survey_questions` - Question bank (text, type, options, section)
- `survey_responses` - User response sessions (respondent_hash, submitted_at)
- `survey_answers` - Individual answer values (value_text, value_num, value_options)

**Members & AI:**
- `members` - User/member data (email, membership_level, company)
- `ai_briefs` - AI-generated insights (member_email, brief_md, filters)
- `question_embeddings` - Vector embeddings for AI (embedding vector, meta)

### Key Relationships

```
surveys
  ├─> survey_questions (survey_id FK)
  │     └─> question_embeddings (question_id FK)
  │     └─> survey_answers (question_id FK)
  └─> survey_responses (survey_id FK)
        └─> survey_answers (response_id FK)
  └─> ai_briefs (survey_id FK)

members
  └─> ai_briefs (member_email)
```

### Row Level Security (RLS)

All tables have RLS enabled. Policies should enforce:
- Users can only access their own survey responses
- Members can only view their own AI briefs
- Public access to survey questions (read-only)

---

## JWT Authentication

### JWT Signing Keys System

**Technology:** Asymmetric key cryptography (public/private pairs)

**Algorithms:**
- NIST P-256 Curve (recommended)
- RSA 2048 (supported)
- Ed25519 (coming soon)

**Benefits:**
- Zero-downtime key rotation
- Better security (private key never leaves Supabase)
- Faster verification (no network calls)
- Public key exposure is safe

**Migration:**
1. Navigate to Dashboard → Authentication → JWT Settings
2. Click "Migrate JWT secret" if not already migrated
3. Create new asymmetric key
4. Update JWT verification to use JWKS endpoint
5. Test thoroughly
6. Rotate to new key

**Rotation Schedule:**
- Quarterly rotation recommended
- Immediate rotation if potential exposure
- After employee offboarding

---

## WordPress Integration Architecture

### Current State (2025-10-07)

- ✅ Basic WordPress theme and plugin stubs exist
- ✅ Template files present
- ❌ UX/UI iteration not applied; WP not conformed to design system
- ❌ Supabase client/auth not wired in frontend
- ❌ Plugin not calling `/me` yet

### Planned Architecture

```
WordPress Frontend (app.js)
  ↓ (uses Publishable Key)
@supabase/supabase-js Client
  ↓ (authenticates users)
User Authentication Flow
  ↓ (JWT with user context)
Survey Submission / AI Briefs
  ↓ (RLS enforced)
Protected Resources

WordPress PHP Backend
  ↓ (calls Edge Functions)
Supabase Edge Functions
  ↓ (use Secret Keys)
Database Access
```

### Implementation Steps

1. Create/update `wp-content/themes/amaa-tmr/assets/js/app.js`
2. Load `@supabase/supabase-js` (CDN or NPM)
3. Initialize client with publishable key
4. Implement auth (magic link)
5. Wire `/me` check into plugin and frontend
6. Build survey submission UI
7. Create AI briefs dashboard (optional MVP-visible)

---

## Edge Functions

### Functions in repo (verify deployment on dashboard)

- `me` — user context + membership
- `survey-submit` — submit survey
- `survey-save-draft` — save draft
- `hubspot-contact-upsert` — HubSpot webhook (no JWT)
- `data-query-charts` — charts (stub)
- `ai-generate-brief` — AI brief (stub)
- `import-winter-2025` — CSV import

Endpoints (once deployed): `https://ffgjqlmulaqtfopgwenf.functions.supabase.co/{function}`

Required secrets before deploy:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (auto)
- `OPENAI_API_KEY` (for AI brief)
- `HUBSPOT_ACCESS_TOKEN`, `HUBSPOT_APP_SECRET` (for webhook)
- `ALLOWED_ORIGIN` (CORS)

### Current Secrets (as of 2025-10-07)

- `SUPABASE_URL` — set (2025-10-06 18:06 UTC)
- `SUPABASE_ANON_KEY` — set (2025-10-06 18:06 UTC)
- `SUPABASE_SERVICE_ROLE_KEY` — set (2025-10-06 18:06 UTC)
- `SUPABASE_DB_URL` — set (2025-10-06 18:06 UTC)
- `OPENAI_API_KEY` — set (2025-10-05 22:11 UTC)
- `ADMIN_TOKEN` — set (2025-10-05 22:12 UTC)
- `HUBSPOT_APP_SECRET` — set (2025-10-05 23:37 UTC)
- `HUBSPOT_ACCESS_TOKEN` — set (2025-10-06 01:58 UTC)
- `ALLOWED_ORIGIN` — not present (set required for CORS)

---

## Storage (Buckets)

- No Supabase storage buckets are defined/used in this project as of 2025-10-07.
- Teaser PDFs are hosted on HubSpot; full/historical PDFs on WP Engine per docs.

---

## Environment Configuration

### `.env` File

```bash
# Supabase Project
SUPABASE_URL=https://ffgjqlmulaqtfopgwenf.supabase.co
SUPABASE_PROJECT_REF=ffgjqlmulaqtfopgwenf

# API Keys (from Dashboard > Settings > API)
SUPABASE_PUBLISHABLE_KEY=<your_publishable_key>
SUPABASE_SECRET_KEY=<your_secret_key>

# Database (optional, for direct connections)
DATABASE_URL=postgresql://postgres:[password]@db.ffgjqlmulaqtfopgwenf.supabase.co:5432/postgres

# Edge Functions
SUPABASE_SERVICE_KEY=${SUPABASE_SECRET_KEY}
```

**Never commit `.env` to Git!** File is already in `.gitignore`.

### Edge Function Secrets

**Location:** https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/functions/secrets

**Auto-Injected:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`

**Custom Secrets (add as needed):**
- `OPENAI_API_KEY` - For AI features
- `STRIPE_SECRET_KEY` - For payments
- `SENDGRID_API_KEY` - For email

**Local Development:**
```bash
# supabase/.env (for local testing)
OPENAI_API_KEY=sk-proj-...
STRIPE_SECRET_KEY=sk_test_...
```

---

## Security Best Practices

### API Key Management

**✅ DO:**
- Use publishable keys in frontend
- Use secret keys only in backend
- Store keys as environment variables
- Rotate keys quarterly
- Separate keys per environment (dev/staging/prod)

**❌ DON'T:**
- Expose secret keys in browser
- Commit `.env` to Git
- Log secret values
- Use service role key in frontend
- Hardcode keys in source

### Row Level Security

**Setup:**
1. Enable RLS on all tables
2. Write comprehensive policies
3. Test policies thoroughly
4. Use Supabase Security Advisor
5. Regular security audits

**Example Policy:**
```sql
-- Users can only read their own survey responses
CREATE POLICY "Users can view own responses"
ON survey_responses FOR SELECT
USING (auth.uid() = respondent_hash::uuid);
```

### Monitoring

**Track:**
- API key usage (hash keys, never log raw)
- Failed authentication attempts
- Unusual access patterns
- Key rotation history

---

## Code Examples

### Frontend (JavaScript)

```javascript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ffgjqlmulaqtfopgwenf.supabase.co',
  '<your_publishable_key>'
)

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Query surveys
const { data: surveys } = await supabase
  .from('surveys')
  .select('*')
  .eq('status', 'active')
```

### Backend (Edge Function)

```typescript
// Deno.serve in Edge Function
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  // Use auto-injected service key
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Admin operation (bypasses RLS)
  const { data } = await supabase
    .from('members')
    .insert({ email: 'new@example.com' })

  return new Response(JSON.stringify(data))
})
```

### WordPress PHP

```php
// Server-side API call
$supabase_url = getenv('SUPABASE_URL');
$secret_key = getenv('SUPABASE_SECRET_KEY');

$response = wp_remote_post("{$supabase_url}/rest/v1/members", [
  'headers' => [
    'apikey' => $secret_key,
    'Authorization' => "Bearer {$secret_key}",
    'Content-Type' => 'application/json'
  ],
  'body' => json_encode(['email' => 'user@example.com'])
]);
```

---

## Troubleshooting

### API Connection Issues

**Problem:** "Invalid API key"
**Solution:** Verify key format and check it hasn't been revoked

**Problem:** RLS errors with secret key
**Solution:** Secret keys bypass RLS - this is expected behavior

**Problem:** Table not found
**Solution:** Check table name spelling (case-sensitive)

### MCP Issues

**Problem:** MCP not connecting
**Solution:** Check browser for OAuth popup (may be blocked)

**Problem:** Authentication fails
**Solution:** Clear Cursor cache, remove MCP config, restart

**Problem:** "Project not found"
**Solution:** Verify `project_ref=ffgjqlmulaqtfopgwenf` in MCP URL

### Edge Function Issues

**Problem:** Can't access secrets
**Solution:** Verify secret added to production, check spelling

**Problem:** Secret keys not available
**Solution:** Use `Deno.env.get()` not `process.env`

---

## Quick Reference

### Important Links

| Resource | URL |
|----------|-----|
| Dashboard | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf |
| API Keys | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/settings/api |
| Edge Secrets | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/functions/secrets |
| JWT Settings | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/settings/auth |

### Documentation

- [SETUP-SECRETS.md](./SETUP-SECRETS.md) - Detailed secrets setup guide
- [FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md) - WordPress integration steps
- [API Keys Docs](https://supabase.com/docs/guides/api/api-keys)
- [Edge Function Secrets](https://supabase.com/docs/guides/functions/secrets)
- [MCP Server Docs](https://supabase.com/docs/guides/getting-started/mcp)

---

## Change Log

| Date | Change |
|------|--------|
| 2025-10-05 | Initial documentation |
| 2025-10-05 | Migrated MCP to hosted server |
| 2025-10-05 | Generated API keys (publishable/secret) |
| 2025-10-05 | Removed all legacy references |
| 2025-10-05 | Updated schema to reflect actual tables |
