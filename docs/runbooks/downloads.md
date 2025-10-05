# Runbook — Downloads (Teaser on HubSpot, Full on WP Engine)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-05
- **Version:** 1.0
- **Owner:** Jonathan

## Teaser (HubSpot)
- Host teasers in HubSpot files
- Example: https://<your-hubspot-domain>/hubfs/reports/2025-winter/teaser.pdf
- Shown to any authenticated user
- Track click as `download_teaser` in GA/HubSpot (optional)

## Full & Historical (WP Engine)
- Upload under `/wp-content/uploads/reports/<slug>/full.pdf`
- Example (staging): `/wp-content/uploads/reports/2025-winter/full.pdf`
- Render within `[tmr_member_only]...[/tmr_member_only]`

## Template example
```html
[tmr_member_only]<a href="/wp-content/uploads/reports/2025-winter/full.pdf" target="_blank" rel="noopener">Download Full Report</a>[/tmr_member_only]
<a href="https://YOUR-HUBSPOT-TEASER-URL" target="_blank" rel="noopener">Download Teaser</a>
```

## Notes
- Keep `slug` consistent with `surveys.slug` (e.g., `2025-winter`).
- Consider signed URLs in a later phase if deep linking is required.