# RetroZetro Back-end

Express and MongoDB API for `retrozetrocomics.com`.

## Standalone Backend Workflow

The backend is intentionally runnable from inside `back-end/` for deploy and operations paths:

```bash
cd back-end
npm ci --ignore-scripts
npm run lint
npm run build
npm run test
```

`npm run ci:check` performs a dry-run `npm ci` lockfile validation so root-level checks can catch backend lock drift before deploy.

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
- Use either local sendmail (`CONTACT_USE_SENDMAIL=true`, optional `CONTACT_SENDMAIL_PATH`) or SMTP (`CONTACT_SMTP_HOST`, `CONTACT_SMTP_PORT`, `CONTACT_SMTP_SECURE`, `CONTACT_SMTP_REQUIRE_TLS`, `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASS`).
