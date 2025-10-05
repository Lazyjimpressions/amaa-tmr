# Supabase Secrets & API Keys Setup Guide

**Project:** TMS (ffgjqlmulaqtfopgwenf)
**Last Updated:** October 5, 2025

---

## Understanding the Difference

### 🔑 API Keys (Project-Level Authentication)

**Purpose:** Authenticate **TO** Supabase from external applications (WordPress, mobile apps, etc.)

**Types:**
- **Publishable Key** (`sb_publishable_...`) - Frontend/client-side use
- **Secret Key** (`sb_secret_...`) - Backend/server-side use

**Where to Get:** https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/settings/api

**Used In:**
- WordPress frontend JavaScript (publishable)
- WordPress PHP backend (secret)
- Mobile apps (publishable)
- External services calling Supabase API (secret)

---

### 🔐 Edge Function Secrets (Environment Variables)

**Purpose:** Store sensitive config/credentials **INSIDE** Edge Functions

**Format:** Key-value pairs (environment variables)

**Where to Set:** https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/functions/secrets

**Used For:**
- Third-party API keys (OpenAI, Stripe, SendGrid, etc.)
- Custom configuration values
- Database connection strings
- OAuth client secrets

**Auto-Injected Secrets (available by default):**
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (bypasses RLS)
- `SUPABASE_DB_URL` - Postgres connection string

---

## Setup Instructions

### Part 1: Generate API Keys (For WordPress Integration)

#### Step 1: Navigate to API Settings
Go to: https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/settings/api

#### Step 2: Generate Publishable Key
1. Look for "Publishable keys" section
2. Click "Generate new key" (if no keys exist)
3. Give it a name: `WordPress Frontend`
4. Copy the key (starts with `sb_publishable_...`)
5. Save to `.env` file:
   ```bash
   SUPABASE_PUBLISHABLE_KEY=sb_publishable_[your-key-here]
   ```

#### Step 3: Generate Secret Key
1. Look for "Secret keys" section
2. Click "Generate new key"
3. Give it a name: `WordPress Backend`
4. Copy the key (starts with `sb_secret_...`)
5. Save to `.env` file:
   ```bash
   SUPABASE_SECRET_KEY=sb_secret_[your-key-here]
   ```

#### Step 4: Create `.env` File
```bash
# From project root
cp env.example .env
```

Edit `.env` with your actual keys:
```bash
# Supabase Project Configuration
SUPABASE_URL=https://ffgjqlmulaqtfopgwenf.supabase.co
SUPABASE_PROJECT_REF=ffgjqlmulaqtfopgwenf

# API Keys (from Dashboard > Settings > API)
SUPABASE_PUBLISHABLE_KEY=sb_publishable_[PASTE-HERE]
SUPABASE_SECRET_KEY=sb_secret_[PASTE-HERE]

# Database URL (optional, for direct connections)
DATABASE_URL=postgresql://postgres:[your-db-password]@db.ffgjqlmulaqtfopgwenf.supabase.co:5432/postgres
```

#### Step 5: Verify Keys Work
Test publishable key (safe to test):
```bash
curl https://ffgjqlmulaqtfopgwenf.supabase.co/rest/v1/ \
  -H "apikey: sb_publishable_[your-key]" \
  -H "Authorization: Bearer sb_publishable_[your-key]"
```

Should return: `{"message":"..."}`

---

### Part 2: Configure Edge Function Secrets (For Backend Logic)

#### Step 1: Navigate to Edge Function Secrets
Go to: https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/functions/secrets

#### Step 2: Add Secrets via Dashboard UI

**For each secret you need:**
1. Click "Add new secret" or similar button
2. Enter **Key name** (e.g., `OPENAI_API_KEY`)
3. Enter **Value** (e.g., `sk-...`)
4. Click "Save" or "Add"

**Common Secrets to Add:**

| Secret Name | Purpose | Example Value |
|------------|---------|---------------|
| `OPENAI_API_KEY` | AI features | `sk-proj-...` |
| `STRIPE_SECRET_KEY` | Payments | `sk_live_...` |
| `SENDGRID_API_KEY` | Email | `SG....` |
| `JWT_SIGNING_SECRET` | Custom auth | `your-secret-here` |

#### Step 3: Add Secrets via CLI (Alternative)

```bash
# Single secret
supabase secrets set OPENAI_API_KEY=sk-proj-...

# Multiple secrets from .env file
supabase secrets set --env-file ./supabase/.env
```

#### Step 4: Verify Secrets Available
Create a test Edge Function to check:

```typescript
// supabase/functions/test-secrets/index.ts
Deno.serve(async (req) => {
  const openaiKey = Deno.env.get("OPENAI_API_KEY")
  const supabaseUrl = Deno.env.get("SUPABASE_URL") // auto-injected

  return new Response(
    JSON.stringify({
      hasOpenAI: !!openaiKey,
      supabaseUrl: supabaseUrl,
      // Never log actual secrets!
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})
```

Deploy and test:
```bash
supabase functions deploy test-secrets
curl https://ffgjqlmulaqtfopgwenf.supabase.co/functions/v1/test-secrets
```

---

### Part 3: Local Development Setup

#### Step 1: Create Local Secrets File
```bash
# Create secrets file for local Edge Functions
touch supabase/.env
```

#### Step 2: Add Local Secrets
Edit `supabase/.env`:
```bash
# Third-party API keys (for local testing)
OPENAI_API_KEY=sk-proj-your-test-key
STRIPE_SECRET_KEY=sk_test_your-test-key
SENDGRID_API_KEY=SG.your-test-key

# Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
# are auto-injected, no need to add them
```

#### Step 3: Add to .gitignore
Ensure secrets aren't committed:
```bash
echo "supabase/.env" >> .gitignore
echo ".env" >> .gitignore
```

#### Step 4: Serve Functions Locally
```bash
# Auto-loads from supabase/.env
supabase functions serve

# Or specify custom file
supabase functions serve --env-file ./supabase/.env
```

---

## Usage in Code

### WordPress Frontend (JavaScript)

```javascript
// wp-content/themes/amaa-tmr/assets/js/app.js
import { createClient } from '@supabase/supabase-js'

// Use PUBLISHABLE key (safe in frontend)
const supabase = createClient(
  'https://ffgjqlmulaqtfopgwenf.supabase.co',
  'sb_publishable_[your-key]' // From .env in production
)

// User authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
```

### WordPress Backend (PHP)

```php
// wp-content/plugins/supabase-bridge/supabase-bridge.php

// Use SECRET key (server-side only)
$supabase_url = getenv('SUPABASE_URL');
$supabase_secret = getenv('SUPABASE_SECRET_KEY');

// Make admin API calls (bypasses RLS)
$response = wp_remote_post("{$supabase_url}/rest/v1/teams", [
  'headers' => [
    'apikey' => $supabase_secret,
    'Authorization' => "Bearer {$supabase_secret}",
    'Content-Type' => 'application/json'
  ],
  'body' => json_encode(['name' => 'New Team'])
]);
```

### Edge Functions (TypeScript)

```typescript
// supabase/functions/submit-survey/index.ts

Deno.serve(async (req) => {
  // Auto-injected secrets (always available)
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

  // Custom secrets (you added these)
  const openaiKey = Deno.env.get("OPENAI_API_KEY")

  // Use service key for admin operations
  const supabase = createClient(supabaseUrl, serviceKey)

  // Your logic here...
})
```

---

## Security Best Practices

### ✅ DO

- **Publishable keys:** Use in frontend, mobile apps, public code
- **Secret keys:** Use ONLY in backend, server-side code
- **Edge Function secrets:** Store third-party credentials here
- **Environment variables:** Always use env vars, never hardcode
- **Rotate keys:** If exposed, generate new keys immediately
- **Separate keys:** Different key per environment (dev/staging/prod)

### ❌ DON'T

- **NEVER** expose secret keys in frontend JavaScript
- **NEVER** commit `.env` or `supabase/.env` to Git
- **NEVER** log secret values (use `console.log(!!secret)` instead)
- **NEVER** use service role key in browser
- **NEVER** hardcode API keys in source code
- **NEVER** share keys in screenshots/docs

---

## Troubleshooting

### Issue: "Invalid API key" error

**Solution:**
1. Verify key format (publishable vs secret)
2. Check key hasn't been revoked
3. Ensure using correct project URL
4. Regenerate key if needed

### Issue: Edge Function can't access secrets

**Solution:**
1. Verify secret added to production (not just local)
2. Check secret name spelling (case-sensitive)
3. Re-deploy function after adding secrets
4. Use `Deno.env.get()` not `process.env`

### Issue: RLS errors with secret key

**Solution:**
- Secret keys bypass RLS - this is expected
- Use publishable key if you want RLS enforcement
- Or ensure RLS policies allow service role access

---

## Quick Reference

### Where Things Live

| Item | Location | Purpose |
|------|----------|---------|
| API Keys | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/settings/api | Auth to Supabase |
| Edge Secrets | https://supabase.com/dashboard/project/ffgjqlmulaqtfopgwenf/functions/secrets | Env vars for functions |
| Local .env | `./env` | WordPress env vars |
| Function .env | `./supabase/.env` | Local Edge Function secrets |

### Key Types Summary

```
Frontend (Browser/Mobile)
  → Publishable Key (sb_publishable_...)
  → Respects RLS
  → Safe to expose

Backend (Server/PHP/Edge Functions)
  → Secret Key (sb_secret_...)
  → Bypasses RLS
  → NEVER expose

Edge Functions (Internal Config)
  → Edge Function Secrets
  → Environment variables
  → Access via Deno.env.get()
```

---

## Next Steps

1. ✅ Generate publishable key
2. ✅ Generate secret key
3. ✅ Create `.env` file with keys
4. ✅ Add Edge Function secrets (if using third-party APIs)
5. ✅ Create local `supabase/.env` for testing
6. ✅ Implement frontend Supabase client
7. ✅ Test authentication flow
8. ✅ Deploy Edge Functions with secrets

---

**Need Help?**
- API Keys Docs: https://supabase.com/docs/guides/api/api-keys
- Edge Function Secrets: https://supabase.com/docs/guides/functions/secrets
- Main Reference: [supabase.md](./supabase.md)
