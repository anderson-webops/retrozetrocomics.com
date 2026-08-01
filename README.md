# retrozetrocomics.com

Website and supporting API for `retrozetrocomics.com`.

## Repo Layout

- `front-end/` - Vite SSG application
- `back-end/` - Express + MongoDB API
- `HEALTHCHECKS.md` - monitor endpoints and expected `200`/`503` behavior

## Common Commands

```bash
npm ci --include=optional --strict-allow-scripts
npm run dev
npm run server
npm run serve
npm run build
npm test
npm run audit
npm run audit:production
```

## Operational Notes

- The root `package-lock.json` is the authoritative lockfile for monorepo installs from the repo root.
- Do not create nested workspace lockfiles or use the removed pnpm workspace configuration.
- Use `npm run server` and `npm run serve` when you want the API and front-end started separately.
- The production container serves the built frontend and Express API from one non-root Node process. `/api/*` always
  returns JSON and cannot fall through to the SPA.
- If you override the public site hostname during builds, also set `VITE_PUBLIC_SITE_ORIGIN` so canonical URLs and SSG API resolution stay correct.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
- The backend runtime user must have write access to `back-end/uploads` and `back-end/uploads/content`. Uploads are written under `back-end/uploads/content/YYYY-MM`, so deploys should provision those directories before the API starts.
- The public contact form now submits through the backend. Set `CONTACT_FROM_EMAIL` and either `CONTACT_USE_SENDMAIL=true` or the `CONTACT_SMTP_*` settings. If `CONTACT_TO_EMAIL` is unset, submissions default to `contacts@jacobdanderson.net`; `CONTACT_BCC_EMAIL` stays optional so future alias-plus-BCC routing is a simple env change.
- Copy `back-end/.env.example` when preparing runtime configuration. Session secrets must be 32+ characters, origins
  must be exact, and `TRUST_PROXY_HOPS` must remain zero unless the deployed proxy chain is known.
- Admin creation, enablement, disablement, and password resets are dry-run-first:

```bash
npm run admin -- disable --email admin@example.com
npm run admin -- disable --email admin@example.com --apply
```

Passwords are prompted interactively and cannot be supplied as command-line arguments. Disabling the final active admin
is refused. See [`docs/security-backend-workflow-audit-2026-07-29.md`](./docs/security-backend-workflow-audit-2026-07-29.md)
for deployment and privacy-migration steps.
