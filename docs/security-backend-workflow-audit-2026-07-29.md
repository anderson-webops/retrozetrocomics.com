# RetroZetro Comics Security and Backend Workflow Audit

Audit period: 2026-07-29 through 2026-08-02
Scope: authentication, authorization, administrator promotion/demotion, privacy, contact mail, Vault/MongoDB access,
uploads, reverse-proxy trust, API/static routing, dependencies, CI, direct production delivery, rollback, and public
verification.

## Outcome

The source-level findings are remediated for the `v2.3.0` release. The repository has one authoritative npm lockfile,
zero known development or production advisories at release validation, explicit Linux x64/ARM64 glibc and musl build
bindings, pinned CI actions, and a direct systemd/Nginx deployment with atomic rollback. Production Docker assets and
container publishing were removed.

Source release and public promotion are separate gates. The public host is not considered updated until it returns the
exact release version, 40-character source revision, deployment timestamp, readiness result, and expected security
boundary over both IPv4 and IPv6.

## Unresolved External Credential Rotation

Secret scanning found that commit `8b8a2a4d431f1a2599a69ac0a56c0423285b9332` tracked `back-end/.env`. The file is
absent from the current tree, and the locally configured session signing key no longer matches that history. The
historical MongoDB URI points only to an unauthenticated localhost database. However, the locally configured Vault
AppRole RoleID and SecretID still match the historical file, and the configured Vault endpoint is unavailable from this
workspace.

Public production promotion remains blocked until an operator with access to the Vault deployment revokes the exposed
SecretID, issues a replacement, updates the protected production environment, and proves the old AppRole login fails.
Rewriting Git history would not retract a credential that was already disclosed. The Gitleaks fingerprint is retained
in `.gitleaksignore` only as a reviewed historical baseline, not as evidence of rotation.

## Authentication and Authorization

- The only account role is `admin`; every protected API route validates the role and active status from MongoDB.
- Sessions carry a schema version, issuance time, last-seen time, and server-side `sessionVersion`.
- Sessions expire after 12 hours idle or seven days absolute. Activity touches the cookie no more than every five
  minutes and never resets absolute issuance time.
- Logout, password reset, enablement, and disablement increment `sessionVersion`, invalidating prior cookies.
- Production cookies use the `__Host-` prefix and are Secure, HttpOnly, `Path=/`, and SameSite Strict.
- Signing-key rotation supports up to eight unique keys. Every key and diagnostics secret must be 32-512 characters and
  cannot use known placeholder or repeated-character values.
- Unknown-account login attempts perform the same Argon2id verification class as known-account failures.
- Password hashes use explicit Argon2id memory, time, parallelism, and output-length settings; successful login upgrades
  an obsolete hash and revokes prior sessions.
- Frontend route visibility is never treated as authorization.

## Promotion, Demotion, and Recovery

Privilege promotion means creating an administrator; demotion means disabling one. The operator CLI supports `create`,
`enable`, `disable`, `reset-password`, and privacy sanitization.

- Every lifecycle command is dry-run-only unless `--apply` is present.
- Passwords are read through a hidden prompt and rejected on command-line arguments.
- Applied lifecycle mutations acquire a short database-backed lease. Concurrent operators cannot both count two active
  administrators and disable the final accounts.
- The final-active-admin check is repeated inside the lease immediately before mutation.
- Every applied change is recorded without email address, IP address, user-agent, password, or token data.
- Status and password changes revoke existing sessions.

Run a dry run first:

```bash
npm run admin -- disable --email admin@example.com
npm run admin -- disable --email admin@example.com --apply
```

## Request, Proxy, and API Boundary

- Production binds only to a literal loopback address; Nginx is the sole public listener.
- Numeric proxy-hop trust was removed. Production accepts one or more exact loopback addresses in
  `TRUSTED_PROXY_IPS`; hostnames, CIDRs, and non-loopback proxies fail startup.
- Production browser origins must be exact HTTPS origins without paths, queries, fragments, or wildcards.
- Unsafe requests reject unapproved origins and cross-site Fetch Metadata. Credentialed CORS is emitted only for an
  allowlisted origin, and state-changing API requests require JSON.
- Unknown `/api/*` routes return JSON `404` and never fall through to the SPA.
- Nginx strips externally supplied diagnostics keys and returns `404` for the diagnostics route. Direct loopback
  diagnostics additionally require a timing-safe match to the configured secret.
- Helmet emits a hash-based script policy. Production script policy contains neither `unsafe-inline` nor `unsafe-eval`.

## Vault and MongoDB

- `VAULT_ADDR`, `VAULT_ROLE_ID`, and `VAULT_SECRET_ID` must be configured together. Partial configuration fails startup.
- Once Vault is selected, login or secret-read failure aborts startup; it never falls back to a direct URI.
- Vault credentials reject placeholders and repeated values. The secret path is a bounded relative API path.
- Vault calls have five-second timeouts, reject redirects, limit response size, validate response shape, and omit
  upstream bodies and credentials from errors.
- Vault requires HTTPS. HTTP is accepted only with an explicit override and a private or loopback literal IP, preventing
  a public hostname from being mislabeled as a private endpoint.
- Production MongoDB requires non-placeholder credentials. A remote URI must use TLS, and options that weaken
  certificate or hostname verification are rejected. Only literal loopback hosts may omit TLS.
- For compatibility with the historical local MongoDB URI, the exact single host `localhost` is canonicalized to
  `127.0.0.1` before validation and connection; multi-host and all other hostname URIs still require verified TLS.
- MongoDB connection, server-selection, socket, idle, and pool limits are bounded.

## Privacy, Contact, and Upload Storage

- Audit records omit administrator email, client IP, user-agent, secrets, and other credential-like fields.
- Contact mail does not collect or transmit IP, user-agent, or referrer; all user-controlled HTML is escaped and header
  newlines are removed.
- SMTP requires TLS 1.2+, certificate verification, and bounded connection, greeting, and socket timeouts.
- Production uploads require an absolute persistent root outside the immutable release checkout.
- Storage prefixes reject traversal and unsafe path segments. Runtime directories use mode `0700`.
- Uploads accept only JPEG, PNG, GIF, WebP, and PDF MIME types. Generated names use canonical extensions instead of the
  user filename, blocking SVG/HTML same-origin active content and extension spoofing.
- Upload responses send `nosniff`, a sandboxed no-content CSP, same-origin resource policy, and attachment disposition
  for PDFs. Display filenames are reduced to a bounded basename.

## Dependency and Supply-Chain Controls

- Node 24.18.1 LTS and npm 12.0.2 are aligned across local metadata, CI, release preparation, and systemd validation.
- Root `package-lock.json` is authoritative; nested lockfiles and alternate package managers are unsupported.
- Full and production-only audits, registry signatures, dependency graph checks, native lock checks, and simulated
  Linux platform installs are required before release.
- Linux x64/ARM64 glibc and musl packages for esbuild, OXC, Rolldown, Rollup, resolver, and Lightning CSS remain explicit
  in the build lockfile.
- The production-only verifier installs just the backend workspace, rebuilds and executes Argon2, imports every direct
  runtime dependency, verifies the built app import, removes compiler/test/bundler packages that npm may retain solely
  as optional workspace peers, and confirms those tools are absent.
- CI runs clean install, lint, typecheck, unit/API tests, build, accessibility, Cypress, ARM64-native build, direct
  runtime boundary smoke, and production-only install verification. Third-party actions use immutable commit SHAs.
- Dependabot covers npm and GitHub Actions. Docker update automation was removed with the production container path.

## Direct Deployment and Rollback

- The dedicated `retrozetro` account runs `back-end/dist/server.js` under systemd with a read-only system view,
  no-new-privileges, restricted namespaces/address families, and only `/srv/retrozetro/shared/uploads` writable.
- Releases are clean Git checkouts beneath `/srv/retrozetro/releases`; `/srv/retrozetro/current` is an atomic symlink.
- Preparation requires exact Node/npm, all source gates, exact static release metadata, a production-only dependency
  install, Argon2 execution, and a clean source diff.
- Promotion writes version, revision, and deployment timestamp into a protected environment file, switches the symlink,
  restarts the service, and reloads a validated Nginx configuration.
- Success requires local liveness/readiness, exact public static/API identity over IPv4 and IPv6, strict headers,
  cross-site write rejection, protected admin access, and blocked public diagnostics.
- Any failed gate restores the prior symlink and release environment and verifies the rollback with the same checks.
- Existing DNS records, including all A and AAAA records, are preserved; deployment does not mutate DNS.
- During migration, the exact historical `/srv/retrozetrocomics.com/back-end` layout receives non-secret runtime
  defaults for its preserved upload directory, exact loopback proxies, static root, and installed release identity.
  It removes the obsolete numeric proxy-hop variable so that the stricter exact-address boundary is authoritative.
  The adapter does not activate for any other path and does not relax Vault, MongoDB, secret, or origin validation.
- Startup logs expose approved configuration or dependency reasons, but never raw messages from unclassified errors.
  This keeps failed promotions diagnosable without logging connection strings, credentials, or dependency internals.

## Production Promotion Checklist

1. Back up MongoDB and `/srv/retrozetro/shared/uploads`.
2. Revoke and replace the historical Vault AppRole SecretID, then prove the old credential is rejected.
3. Create the dedicated system account and install `deploy/systemd/retrozetro.service` without starting it.
4. Populate `/etc/retrozetro/retrozetro.env` with non-placeholder secrets, authenticated MongoDB or the rotated Vault
   path, HTTPS origins, and exact loopback proxy addresses.
5. Include `deploy/nginx/retrozetro.locations.conf` in the existing IPv4/IPv6 TLS server configuration and validate it.
6. Back up and migrate any prior upload volume to `/srv/retrozetro/shared/uploads` with ownership `retrozetro` and mode
   `0700`.
7. Clone the exact tagged release beneath `/srv/retrozetro/releases`, run `prepare-release.sh` as `retrozetro`, then run
   `promote-release.sh` as root.
8. Run the GitHub post-deploy verifier with the exact version and 40-character revision.
9. Verify sign-in, sign-out, content editing, contact delivery, admin dry runs, audit sanitization, and rollback with
   operator-controlled test data.
