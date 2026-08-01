# RetroZetro Comics Security and Backend Workflow Audit

Audit period: 2026-07-29 through 2026-08-01
Scope: authentication, authorization, administrator promotion/demotion, privacy, contact mail, Vault/MongoDB access,
uploads, reverse-proxy trust, API/static routing, dependencies, CI, and production container delivery.

## Outcome

The source-level findings identified in this audit are remediated in the `v2.2.0` release candidate. The repository now
has one authoritative npm lockfile, zero known development or production advisories, explicit Linux x64/ARM64 glibc and
musl native bindings, pinned CI actions, and a non-root container that serves both the API and static frontend.

Public production promotion is a separate operator step. Until the released container is deployed and the post-deploy
workflow confirms the exact version and revision, these results describe the repository and release artifact rather
than the currently served host.

## Historical Credential Finding

Secret scanning found that commit `8b8a2a4d431f1a2599a69ac0a56c0423285b9332` tracked `back-end/.env`. The file is
absent from the current tracked tree, and the locally configured session signing key is no longer the historical value.
The historical MongoDB URI points only to an unauthenticated localhost database, so it does not contain a remote
credential. However, the local Vault AppRole RoleID and SecretID still match the historical file. The configured Vault
endpoint is currently unavailable, so revocation cannot be verified or performed from this workspace.

Production promotion is blocked until an operator with access to the actual Vault deployment revokes the historical
SecretID, issues a replacement, updates the runtime secret store, and proves the old AppRole login fails. Rotating the
credential is required even if Git history is later rewritten; history cleanup alone cannot retract a disclosed secret.
The exact Gitleaks fingerprint is recorded in `.gitleaksignore` only as a reviewed historical baseline, not as evidence
that rotation is complete.

## Authentication and Authorization

- Sessions now contain a schema version, issuance time, last-seen time, and the administrator's server-side
  `sessionVersion`.
- Sessions expire after 12 hours idle or seven days absolute. Activity only touches the cookie every five minutes.
- Logout, password reset, disablement, and enablement increment `sessionVersion`, invalidating every prior cookie.
- Production cookies use the `__Host-` prefix and are Secure, HttpOnly, path-scoped to `/`, and SameSite Strict.
- Cookie signing supports deliberate key rotation through `SESSION_SECRET_PREVIOUS`; every key must be at least 32
  characters.
- Authentication requires the stored role to be exactly `admin` and status to be `active`. Missing, disabled, invalid
  role, and wrong-password accounts receive the same public failure.
- Unknown-account login attempts perform an Argon2 verification to reduce account-existence timing differences.
- Passwords use Argon2id with explicit memory, time, parallelism, and hash-length settings. Older hashes are upgraded
  after a successful login.
- API authorization remains server-side. Frontend visibility controls are not treated as access controls.

## Promotion, Demotion, and Recovery

The application has no non-admin member role, so privilege promotion means creating an admin and demotion means
disabling one. The CLI supports `create`, `enable`, `disable`, and `reset-password`.

- Every command is dry-run-only unless `--apply` is supplied.
- Passwords are entered through a hidden prompt and command-line password arguments are rejected.
- The tool refuses to disable the final active administrator.
- Every applied lifecycle change is recorded without email address, IP address, or user-agent metadata.
- Status and password changes revoke existing sessions.

Run a dry run before every production mutation:

```bash
npm run admin -- disable --email admin@example.com
npm run admin -- disable --email admin@example.com --apply
```

## Request, Proxy, and API Boundary

- Reverse-proxy trust now defaults to zero hops. `TRUST_PROXY_HOPS` accepts only integers from zero through ten.
- Browser mutations reject disallowed origins and cross-site Fetch Metadata. CORS is credentialed only for exact
  configured origins; wildcards and origins containing paths are rejected at startup.
- State-changing API requests require JSON. The browser login, logout, contact, and content-editing clients use that
  contract, so form-encoded cross-site submissions cannot trigger mutations.
- Unknown `/api/*` routes return JSON `404` responses and cannot fall through to the SPA.
- Liveness and readiness are available under `/api/healthz` and `/api/readyz`; root aliases are retained for monitors.
- Diagnostics moved to `/api/internal/dbinfo`. Production access requires a timing-safe match against a 32+ character
  key; there is no loopback bypass because a local reverse proxy can make public requests appear loopback.
- Legacy unauthenticated `/auth`, `/admin`, and `/site-content` mounts were removed.
- Helmet now emits a script policy based on hashes from the built HTML. The production script policy contains neither
  `unsafe-inline` nor `unsafe-eval`.

## Privacy and Contact Workflow

- New audit records no longer store administrator email, client IP, or user-agent.
- Audit details and snapshots recursively discard secret-, token-, password-, email-, IP-, and user-agent-like keys.
- The admin API no longer returns historical network identifiers.
- Contact mail no longer collects or transmits IP address, user-agent, or referrer.
- Every user-controlled HTML contact field is escaped. Subject/header newlines are removed.
- SMTP enforces TLS 1.2+ with certificate verification and bounded connection, greeting, and socket timeouts.
- Run the privacy cleanup once after taking a MongoDB backup:

```bash
npm run admin -- sanitize-audit-logs
npm run admin -- sanitize-audit-logs --apply
```

## Vault, Database, Errors, and Storage

- Vault is contacted only when address, role ID, and secret ID are all configured.
- Vault calls have a five-second timeout, validate response shape, and never include upstream response bodies in errors.
- HTTPS is required by default. A deliberately private HTTP Vault endpoint requires `VAULT_ALLOW_HTTP=true`.
- MongoDB connection and server-selection timeouts are bounded.
- Public error responses expose only allowlisted `AppError` messages; arbitrary 4xx exceptions and filesystem paths are
  not returned.
- Upload directories are created with mode `0700`. The runtime image runs as the unprivileged Node user and declares
  the upload directory as its writable volume.

## Dependency and Delivery Controls

- Runtime baseline: Node 24.18.1 LTS and npm 12.0.2 across local metadata, CI, Netlify, and Docker.
- One root `package-lock.json` is authoritative. The nested backend lock and stale pnpm workspace were removed.
- The destructive `sudo rm -rf` clean command was replaced with a bounded Node script that preserves lockfiles.
- Full and production-only npm audits report zero advisories.
- Registry signature verification covers the complete installed graph.
- The lockfile explicitly pins all required esbuild, OXC parser/formatter, Rolldown, Rollup, unrs-resolver, and
  Lightning CSS Linux x64/ARM64 glibc/musl packages.
- CI performs clean installs, supply-chain checks, lint, typecheck, frontend/backend tests, build, accessibility,
  Cypress, native ARM64, and read-only container checks.
- All third-party GitHub Actions are pinned to immutable commit SHAs.
- Tagged releases publish AMD64/ARM64 GHCR images with provenance and SBOM attestations. Immutable version and
  source-revision tags cannot be overwritten.
- Dependabot covers npm, GitHub Actions, and Docker dependencies.

## Production Promotion Checklist

1. Back up MongoDB and the persistent upload volume.
2. Revoke the AppRole SecretID exposed in historical commit `8b8a2a4d`, issue a replacement, update the runtime secret
   store, and verify the old login is rejected.
3. Configure the variables from `back-end/.env.example`; remove the obsolete `CROSS_SITE` setting.
4. Set `TRUST_PROXY_HOPS` to the verified proxy count, not a guessed value.
5. If Vault is intentionally HTTP on a private interface, explicitly set `VAULT_ALLOW_HTTP=true`; otherwise migrate it
   to HTTPS.
6. Run the audit metadata sanitizer in dry-run mode, then with `--apply`.
7. Deploy the immutable `ghcr.io/anderson-webops/retrozetrocomics.com:2.2.0` image by digest with the upload volume
   mounted at `/app/back-end/uploads`.
8. Route the public host to the single container port. Do not separately map root health or diagnostics requests to the
   SPA.
9. Run the `Post-deploy verification` workflow with the exact release version and 40-character revision.
10. Confirm `/release.json`, `/api/healthz`, `/api/readyz`, authentication, content editing, contact delivery, and a
   rollback using the prior immutable image.
