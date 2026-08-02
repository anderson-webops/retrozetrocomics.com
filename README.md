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
- Production uses the unprivileged `retrozetro` systemd service behind Nginx. The loopback-only Node process serves the
  built frontend and Express API together; `/api/*` always returns JSON and cannot fall through to the SPA.
- If you override the public site hostname during builds, also set `VITE_PUBLIC_SITE_ORIGIN` so canonical URLs and SSG API resolution stay correct.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
- Production uploads live outside immutable releases at `/srv/retrozetro/shared/uploads`. Only JPEG, PNG, GIF, WebP,
  and PDF files are accepted; generated filenames use canonical extensions, and PDFs are served as attachments.
- The public contact form now submits through the backend. Set `CONTACT_FROM_EMAIL` and either `CONTACT_USE_SENDMAIL=true` or the `CONTACT_SMTP_*` settings. If `CONTACT_TO_EMAIL` is unset, submissions default to `contacts@jacobdanderson.net`; `CONTACT_BCC_EMAIL` stays optional so future alias-plus-BCC routing is a simple env change.
- Use `deploy/systemd/retrozetro.env.example` for production. Session and diagnostics secrets must be non-placeholder
  random values, production origins must use HTTPS, and `TRUSTED_PROXY_IPS` must contain only the exact loopback proxy
  addresses. A configured Vault path fails closed and never silently falls back to `MONGODB_URI`.
- A production `mongodb://` URI with the exact single host `localhost` is canonicalized to `127.0.0.1` before validation
  and connection. Other hostnames remain remote and require verified TLS.
- Admin creation, enablement, disablement, and password resets are dry-run-first:

```bash
npm run admin -- disable --email admin@example.com
npm run admin -- disable --email admin@example.com --apply
```

Passwords are prompted interactively and cannot be supplied as command-line arguments. Applied lifecycle changes use a
database lease so simultaneous operators cannot race past the final-active-admin guard.

## Direct production deployment

The repository contains the complete non-container deployment contract:

- `deploy/systemd/retrozetro.service` runs Node 24.18.1 as the dedicated `retrozetro` account with a read-only system
  view and only the shared upload directory writable.
- `deploy/nginx/retrozetro.locations.conf` proxies the existing IPv4 and IPv6 TLS listeners to `127.0.0.1:3006` and
  blocks public diagnostics headers and routes.
- `deploy/systemd/prepare-release.sh` validates a clean release checkout, performs all dependency and application gates,
  builds exact source metadata, and reduces the tree to audited backend runtime dependencies.
- `deploy/systemd/promote-release.sh` atomically changes `/srv/retrozetro/current`, writes exact deployment identity,
  verifies local readiness and both public address families, and restores the prior release if any gate fails.

Before the first direct promotion, back up MongoDB and uploads, rotate the Vault AppRole SecretID exposed in historical
commit `8b8a2a4d431f1a2599a69ac0a56c0423285b9332`, and prove the old login is rejected. Production promotion remains blocked
until that external credential rotation is complete. See
[`docs/security-backend-workflow-audit-2026-07-29.md`](./docs/security-backend-workflow-audit-2026-07-29.md) for the full
security findings, migration sequence, and rollback requirements.
