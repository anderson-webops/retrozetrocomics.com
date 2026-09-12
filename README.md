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
- The canonical direct-release profile uses the unprivileged `retrozetro` systemd service behind Nginx. The audited
  compatibility host instead uses `tyler-backend.service`; see the content handoff before server changes. In either
  profile, `/api/*` must return JSON and cannot fall through to the SPA.
- If you override the public site hostname during builds, also set `VITE_PUBLIC_SITE_ORIGIN` so canonical URLs and SSG API resolution stay correct.
- Use [`HEALTHCHECKS.md`](./HEALTHCHECKS.md) for deployment monitor targets instead of `/`.
- Canonical uploads live outside immutable releases at `/srv/retrozetro/shared/uploads`; the compatibility host uses
  `/srv/retrozetrocomics.com/back-end/uploads`. Only JPEG, PNG, GIF, WebP,
  and PDF files are accepted. The backend verifies signatures, decodes and re-encodes images without metadata, rejects
  active or encrypted PDFs, and serves PDFs as attachments. Permanent deletion is available only from trash after a
  recent passkey confirmation and is blocked while current saved or published content still uses the file.
- The public contact form now submits through the backend. Set `CONTACT_FROM_EMAIL` and either `CONTACT_USE_SENDMAIL=true` or the `CONTACT_SMTP_*` settings. If `CONTACT_TO_EMAIL` is unset, submissions default to `contacts@jacobdanderson.net`; `CONTACT_BCC_EMAIL` stays optional so future alias-plus-BCC routing is a simple env change.
- Use `deploy/systemd/retrozetro.env.example` for production. Session and diagnostics secrets must be non-placeholder
  random values, production origins must use HTTPS, and `TRUSTED_PROXY_IPS` must contain only the exact loopback proxy
  addresses. A configured Vault path fails closed and never silently falls back to `MONGODB_URI`; plaintext Vault is
  accepted only on literal loopback, and the historically exposed SecretID fingerprint is denied even if it remains
  present in a local environment file.
- Current site content accepts media-library paths and bundled `/brand/` or `/legacy-images/` files. Deliberate external
  image hosting remains available by listing exact HTTPS DNS hostnames in `CONTENT_IMAGE_HOSTS`; those same hosts are
  added narrowly to the browser image policy.
- The home page, story arcs, characters, and world entries use the managed `SiteContent` API. When a page has no
  database record, reviewed source defaults remain available. The public navigation also includes source-backed Worlds
  and Artwork pages. The Artwork page presents the exact 85 reviewed hand-drawn images already in the local media
  library, with no copying, re-uploading, or media-record changes. See
  [`deploy/content/tyler-site-content-v1.json`](./deploy/content/tyler-site-content-v1.json) for the complete 85-key
  gallery inventory and the five available raw creative-source versus live importer-sanitized hash baselines, and
  [`deploy/content/SERVER_AI_HANDOFF.md`](./deploy/content/SERVER_AI_HANDOFF.md) for bounded activation checks.
- The List and The Fall of a Dream have separate illustrated reading pages at `/stories/the-list` and
  `/stories/fall-of-a-dream`, exposing all seven existing editable beats. Twelve default character profiles support
  optional longer biographies and text-only entries. Source review is documented in
  [`READER_RELEASE_REVIEW.md`](./deploy/content/READER_RELEASE_REVIEW.md), not shown to visitors.
- All 85 gallery links are in the initial HTML. Builds run `scripts/verify-public-html.mjs` to check the ten public
  routes, titles, descriptions, canonical links, sitemap, gallery completeness, and disabled ad placeholders.
- The three ad placements are commented out in `front-end/src/layouts/default.vue`, with restoration instructions;
  `SiteAdSlot.vue` and its styles remain. Optional ad/analytics scripts are disabled, while AdSense verification
  metadata and ads.txt remain. Creator and Privacy pages are linked in the footer. Re-enabling tracking requires a
  separate privacy/consent review, not merely uncommenting a placement.
- Every generated page carries a restrictive hash-based static script policy, and the owner page also carries no-index
  metadata. This preserves the intended browser boundary if a legacy edge configuration temporarily lags the application
  release. The Nginx route policy remains the authoritative production header and is checked independently after promotion.
- A production `mongodb://` URI with the exact single host `localhost` is canonicalized to `127.0.0.1` before validation
  and connection. Other hostnames remain remote and require verified TLS.
- Admin creation, enablement, disablement, and password resets are dry-run-first:

```bash
npm run admin -- disable --email admin@example.com
npm run admin -- disable --email admin@example.com --apply
```

Passwords are prompted interactively and cannot be supplied as command-line arguments. Applied lifecycle changes use a
database lease so simultaneous operators cannot race past the final-active-admin guard.

Owner sign-in requires a passkey after the password is accepted. A first sign-in receives an enrollment-only session
that cannot reach the editor until passkey setup succeeds. Recovery codes are displayed once and stored only as Argon2
hashes. Operators can safely recover an account or replay preserved audit events with dry-run-first commands:

```bash
npm run admin -- reset-mfa --email admin@example.com
npm run admin -- reset-mfa --email admin@example.com --apply
npm run admin -- replay-audit-outbox
npm run admin -- replay-audit-outbox --apply
```

Production defaults WebAuthn to `PUBLIC_SITE_ORIGIN`; the explicit `WEBAUTHN_ORIGIN` and `WEBAUTHN_RP_ID` values in the
environment example document the required relying-party boundary. Development on another origin must set both values
to the exact browser origin and its hostname.

## Direct production deployment

The repository contains the complete non-container deployment contract:

- `deploy/systemd/retrozetro.service` runs Node 24.18.1 as the dedicated `retrozetro` account with a read-only system
  view and only the shared upload directory writable.
- `deploy/nginx/retrozetro.locations.conf` proxies the existing IPv4 and IPv6 TLS listeners to `127.0.0.1:3006` and
  blocks public diagnostics headers and routes.
- `deploy/systemd/prepare-release.sh` validates a clean release checkout, performs all dependency and application gates,
  builds exact source metadata, and reduces the tree to audited backend runtime dependencies.
- `deploy/systemd/promote-release.sh` atomically changes `/srv/retrozetro/current`, writes exact deployment identity,
  verifies local readiness and both public address families, dispatches independent GitHub post-deploy verification,
  and restores the prior release if any gate or dispatch fails. The required root-owned GitHub token file and minimum
  permission are documented in `deploy/systemd/README.md`.

Before the first direct promotion, back up MongoDB and uploads, rotate the Vault AppRole SecretID exposed in historical
commit `8b8a2a4d431f1a2599a69ac0a56c0423285b9332`, and prove the old login is rejected. Production promotion remains blocked
until that external credential rotation is complete. See
[`docs/security-backend-workflow-audit-2026-07-29.md`](./docs/security-backend-workflow-audit-2026-07-29.md) for the full
security findings, migration sequence, and rollback requirements.
