# Runbook — Deploy to WP Engine (Staging & Prod)

## Document Information
- **Created:** 2025-10-05
- **Last Updated:** 2025-10-07
- **Version:** 1.0
- **Owner:** Jonathan

## Branches
- `staging` → WP Engine: marketrepstg
- `main` → WP Engine: thereport

## Secrets (GitHub > Repo > Settings > Secrets and variables > Actions)
- STAGING_SFTP_HOST = marketrepstg.sftp.wpengine.com
- STAGING_SFTP_USER = marketrepstg-admin
- STAGING_SFTP_PASS = ********
- PROD_SFTP_HOST = thereport.sftp.wpengine.com
- PROD_SFTP_USER = thereport-admin
- PROD_SFTP_PASS = ********

## Workflow (summary)
- Upload **theme** from `wp-content/themes/amaa-tmr` to remote `wp-content/themes/`
- Upload **plugin** from `wp-content/plugins/supabase-bridge` to remote `wp-content/plugins/`
- Use SFTP (port 2222). Always upload into the **parent** directory (prevents `amaa-tmr/amaa-tmr` nesting).

## Troubleshooting
- If you see "canonicalize" errors, ensure `remote_path` is the parent directory.
- Use IPv4: `-4 -o StrictHostKeyChecking=no`
- Confirm WPE shows the theme in Appearance → Themes (requires `style.css` header).

## Post-deploy
- Activate theme & plugin (staging).
- Verify pages & links (teaser/full).