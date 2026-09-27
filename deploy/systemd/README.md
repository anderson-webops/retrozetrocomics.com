# Immutable production artifact workflow

This workflow replaces mutable release checkouts with a reviewed Linux ARM64
runtime archive. It does not authorize production deployment or changes to DNS,
certificates, firewall rules, Nginx routing, credentials, content, uploads, or
the database.

## Preserved host contracts

The runtime archive is topology-neutral. The actual production host currently
uses the compatibility layout documented in
`../content/SERVER_AI_HANDOFF.md`. Do not replace that healthy layout with
`/srv/retrozetro/current` or `retrozetro.service` merely because the canonical
direct-service controls exist here. A compatibility installer may copy the
verified archive's backend, static output, and production dependencies into the
reviewed host paths, but it must verify the exact installed tree again after the
copy and preserve the service account, port, environment files, upload root,
Nginx policy, certificates, and IPv4/IPv6 listeners.

For a separately approved canonical direct-service migration, preserve:

- service user and group: `retrozetro:retrozetro`;
- loopback port: `127.0.0.1:3006`;
- immutable releases: `/srv/retrozetro/releases`;
- current symlink: `/srv/retrozetro/current`;
- uploaded media: `/srv/retrozetro/shared/uploads`;
- protected configuration: `/etc/retrozetro/*.env`.

Uploaded media and MongoDB data are writable state. They stay outside every
archive and must survive both promotion and rollback. A database migration must
remain compatible with the exact retained application rollback unless the
operator approves and verifies a separate transition plan.

## Builder boundary

Use a locked `retrozetro-builder` account that is not a member of
`retrozetro`, `tyler`, or `site_retrozetro`. It must not be able to read any
production environment file. The runtime account must not own or write release
archives, immutable release directories, the root-installed verifier, or the
promoter.

On Linux ARM64 with Node 24.18.1 and npm 12.0.2:

1. Check out the exact source commit as `retrozetro-builder`.
2. Add `/.ai-work/` to the checkout's local Git exclude and create an empty
   `.ai-work/runs/<release>` directory.
3. Provide only a disposable, loopback-only, credentialed
   `retrozetro_artifact_*` MongoDB fixture. Do not expose production credentials
   to the builder.
4. Run `prepare-release.sh` with that empty output directory. The build fails if
   the builder can read a known production environment or belongs to a runtime
   group. It re-executes under a clean temporary home with no user or global npm
   configuration and exposes only the synthetic fixture URI to dependency and
   build processes.
5. Retain the archive, `SHA256SUMS`, `runtime-manifest.json`, and
   `acceptance.json` together. The acceptance test runs the exact unpacked
   archive without source or development dependencies, checks Argon2, Sharp,
   the compiled administrator CLI, health/readiness, dependency failure,
   published HTML, graceful shutdown, a post-copy tree, and a deliberately
   missing module.

The archive contains only the reviewed manifests, compiled backend, static and
server-rendering assets, and the root-lock-backed backend production dependency
closure. It excludes credentials, private configuration, uploads, database
files, source, caches, queues, logs, and development dependencies.

## Root-controlled installation and promotion

`install-service.sh --dry-run` prints a digest of the exact control bundle.
After independent review, pass that digest as `EXPECTED_CONTROL_SHA256` to the
mutating invocation. The installer places versioned, root-owned controls under
`/usr/local/libexec/retrozetro`, makes the release and incoming directories
root-owned, preserves existing protected environment files, and verifies that
the builder still cannot read the secret environment.

Copy an accepted archive into the root-only incoming directory without changing
its bytes. Invoke the installed promoter with the independently reviewed archive
SHA-256 and full source commit. When a current artifact release exists, also
provide its independently retained archive, SHA-256, and commit. The promoter:

1. verifies root ownership and non-writable parents for itself, its verifier,
   its contract, and both archives;
2. verifies the retained rollback tree against its independently stored archive;
3. unpacks into a new root-owned directory and checks every path, hash, mode,
   required entrypoint, dependency, identity, and native binding before and
   after final placement;
4. atomically switches the current symlink and release identity environment;
5. restarts only the application service and checks local health, readiness,
   identity, public IPv4/IPv6 identity and headers, and denial behavior;
6. restores the separately verified previous artifact and identity environment
   if any required acceptance step fails.

The promoter refuses a mutable pre-artifact checkout. Before the first direct
artifact promotion, the server operator must use a reviewed, root-only
transition procedure to seal the currently running release and its exact legacy
acceptance behavior. Do not weaken this guard, trust a marker created inside a
writable checkout, or rebuild during root promotion.

The application retains a narrowly scoped adapter for the pre-existing
`/srv/retrozetrocomics.com/back-end` plus
`/var/www/retrozetrocomics.com` deployment. It supplies only non-secret,
exact-path defaults and derives identity from the installed `release.json`.
This compatibility path does not authorize a service-layout migration or weaken
artifact verification.
