# RetroZetro Back-end

Express and MongoDB API for `retrozetrocomics.com`.

## Backend Workflow

Install only from the repository root so the authoritative workspace lockfile is always used:

```bash
npm ci --include=optional --strict-allow-scripts
npm run -w back-end lint
npm run -w back-end typecheck
npm run -w back-end build
npm run -w back-end test
```

There is intentionally no `back-end/package-lock.json`.

## Upload Storage

- Uploaded files are written to `back-end/uploads/content/YYYY-MM`.
- The backend runtime user must have write access to:
  - `back-end/uploads`
  - `back-end/uploads/content`
- If those directories are missing or not writable, the API now logs the real filesystem error server-side and returns a sanitized upload failure message to clients instead of leaking internal paths.

## Deployment Note

If infrastructure or provisioning automation exists outside this repo, keep the upload directory ownership and ACLs aligned with the backend runtime user so deploys do not drift back into permission failures.

## Contact Form Mail

The backend now handles public contact form delivery.

- `CONTACT_FROM_EMAIL` is required.
- If `CONTACT_TO_EMAIL` is unset, messages go directly to `contacts@jacobdanderson.net`.
- `CONTACT_BCC_EMAIL` is optional and can be added later if you want alias-based outbound mail with a monitoring copy.
- Use either local sendmail (`CONTACT_USE_SENDMAIL=true`, optional `CONTACT_SENDMAIL_PATH`) or SMTP (`CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE`, `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASS`).
- SMTP always requires TLS 1.2 or newer and uses bounded connection/socket timeouts.

## Admin Lifecycle

The account tool is dry-run-first and supports `create`, `enable`, `disable`, `reset-password`, and
`sanitize-audit-logs`. Add `--apply` only after reviewing the dry run:

```bash
npm run admin -- create --email admin@example.com --name "Site Admin"
npm run admin -- create --email admin@example.com --name "Site Admin" --apply
npm run admin -- sanitize-audit-logs
npm run admin -- sanitize-audit-logs --apply
```

All status and password changes revoke existing sessions. The final active admin cannot be disabled.
