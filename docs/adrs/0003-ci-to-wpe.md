# ADR 0003 — CI/CD via GitHub Actions to WP Engine (SFTP)
Status: Accepted • 2025-10-05

Decision
- Deploy theme & plugin via SFTP on pushes:
  - `staging` → marketrepstg
  - `main` → thereport

Notes
- Port 2222; upload into parent dirs (themes/plugins).
- Ensure `style.css` header for theme visibility.

