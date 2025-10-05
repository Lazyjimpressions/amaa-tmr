# ADR 0001 — Authentication with Supabase (not HubSpot)
Status: Accepted • 2025-10-05

Decision
- Use Supabase Auth (magic link) for JWT & RLS.
- HubSpot remains CRM and membership truth, not session provider.

Consequences
- Clean `auth.uid()` for RLS & EF auth.
- Webhook/batch sync needed for membership flags.

