
# ADR 0002 — RLS anchored to auth.uid()
Status: Accepted • 2025-10-05

Decision
- User-owned tables include `user_id uuid` (FK → `auth.users(id)`).
- RLS policies use `user_id = auth.uid()`.

Rationale
- Immutable, non-PII, best-practice for Postgres RLS.

