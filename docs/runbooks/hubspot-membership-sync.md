# Runbook — HubSpot → Supabase Membership Sync

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

## Source of truth
- HubSpot Contact property: **`membership_status___amaa`**
- Rule: value "Active" ⇒ member (true), else false

## Edge Function: `hubspot-contact-upsert`
- Method: POST (webhook or batch job)
- Body:
  ```json
  {
    "email": "someone@example.com",
    "membership_status___amaa": "Active",
    "membership_level": "Individual"
  }
  ```

## Logic
- upsert into members by email (lowercased)
- set is_member = (membership_status___amaa === "Active")
- set membership_level if provided

## Notes
- If a user logs in before HS sync, /me may show is_member=false temporarily.
- Consider nightly reconciliation if webhooks are unreliable. Alternatively, consider that supabase member record is updated when member status is created or changed in hubspot.