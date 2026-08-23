# Tyler source-backed site content handoff

Install the exact annotated release tag supplied by Jacob. Follow this file as the scope authority for the content
activation. Do not infer additional canon or publish any source archive document.

## Intended result

- The public home page presents seven story, character, world, and artwork highlights using existing imported
  hand-drawn images.
- The public Story and Characters pages carry expanded direct descriptions, while the new Worlds page presents four
  worlds, three conflicts or adventures, and four technology entries.
- The new Artwork page presents the exact 85 reviewed hand-drawn images listed in
  `deploy/content/tyler-site-content-v1.json`, with filters and full-size views.
- Public copy presents the stories and worlds directly without publishing archive notes, source-message history, or
  editorial commentary.
- The owner workspace includes **Edit the home page**, with private drafts, preview, media-library selection,
  publication confirmation, and revision recovery.
- Existing owner-authored `SiteContent` records remain authoritative and are never overwritten automatically.
- The existing 85 media records and files remain in place. This release uploads, moves, deletes, or transforms no media.
- This handoff authorizes no S3 access or migration, no media write or reimport, no automatic `SiteContent` seed, and
  no publication action or state change.

## Actual deployment profile

This handoff explicitly supports the audited compatibility deployment unless the server has already completed a
separately reviewed migration to the canonical direct-release service:

- service: `tyler-backend.service`
- service account: `tyler:tyler`
- imported-media ownership: `tyler:site_retrozetro`, mode `0600`
- backend: `/srv/retrozetrocomics.com/back-end`
- static site: `/var/www/retrozetrocomics.com`
- executable: `/opt/node-24.19.0/bin/node`
- upload root: `/srv/retrozetrocomics.com/back-end/uploads`
- protected environment files: `/etc/backend-env/tyler-backend/tyler-backend.env`,
  `/etc/backend-env/tyler-backend/mongo.env`, and `/etc/backend-env/tyler-backend/release.env`

Do not force this server into the `/srv/retrozetro/current` or `retrozetro.service` profile merely to satisfy the
canonical deployment scripts. A service-layout migration is outside this content release unless Jacob separately
authorizes and reviews it.

## Preflight

1. Resolve the supplied annotated tag to its full commit and require the release tag, checkout, package versions, and
   built `release.json` to agree exactly. Require a clean checkout of the tag.
2. Run the repository's pinned Node 24/npm 12 path and all release gates: `npm ci`, audit, lint, typecheck, tests,
   build, deployment-asset verification, and direct-runtime smoke tests.
3. Read `deploy/content/tyler-site-content-v1.json`. Require its artwork gallery to contain exactly 85 unique storage
   keys, numbered `001` through `085`, and require the built Artwork index to contain the identical set. For every key
   beneath the upload root, verify regular-file type, path containment, owner `tyler`, group `site_retrozetro`, mode
   `0600`, and ACL state. Record a pre-deploy SHA-256 inventory of the stored bytes for later equality checking.
4. For the five entries in `referencedMedia`, additionally verify the stored importer-sanitized bytes against
   `storedSanitizedSha256`. Retain `sourceSha256` only as the raw creative-source provenance hash. Do not compare a
   stored sanitized file or public response directly with `sourceSha256`, and do not treat the expected difference
   between those hashes as damage. The other 80 files have no checked-in sanitized-byte baseline, so verify their
   identity through the exact storage-key set and unchanged pre-deploy versus post-deploy stored-byte hashes. Do not
   repair, rename, or replace a mismatch during this deployment.
5. Through a confined read-only process that loads the protected environment through systemd PID 1, verify:
   - exactly 85 active `MediaAsset` records remain under `content/tyler-handdrawn-v1/`, with an exact key-set match to
     the artwork gallery manifest;
   - all 85 storage keys have active image records with provider `local`;
   - media capacity remains within the 120-item limit;
   - metadata for `home-page`, `about-page`, and `characters-page`, including record existence, published version,
     draft presence, and timestamps. Do not read or print content-bearing fields merely to establish this gate.
6. Expect those three `SiteContent` records to be absent based on the last verified state. If any record now exists,
   preserve it. Report which checked-in defaults it overrides, and do not seed, replace, merge, or publish it.
7. Record pre-deploy release identity, service status, `/healthz`, `/readyz`, media counts, relevant content-record
   metadata, all 85 storage keys and stored-byte hashes, and `storedSanitizedSha256` results for the five baseline
   files. Record a pre-deploy upload inventory whose invariants are content, path, hash, ownership, mode, ACLs, and file
   count. Do not require upload `ctime` to remain unchanged because the server's `site-perms` process may legitimately
   refresh it. Do not create an upload
   backup because this release has no upload write path. Use the established database backup procedure only if an
   unexpected database write becomes necessary, and stop for explicit approval before that write.

## Deployment

1. Build and stage the exact tagged artifact away from the live backend and static roots.
2. Before any live mutation, create and verify a complete local pre-mutation artifact snapshot of the installed
   backend, static site, and compatibility release metadata. Record its identifier, inventory, checksums, and restore
   command. This snapshot protects application deployment rollback only and does not replace an off-server backup.
3. Preserve the protected environment files, upload tree, ownership model, service confinement, and Nginx rules.
4. Perform a verified transactional compatibility deployment: install the staged backend and static artifacts, restart
   only `tyler-backend.service`, run every acceptance check, and automatically restore the pre-mutation artifact
   snapshot if installation or acceptance fails. This legacy deployment is not a symlink-based atomic release. Do not
   require `/srv/retrozetro/current`, `retrozetro.service`, or a service-layout migration.
5. Set `SOURCE_DATE_EPOCH` to the tagged commit timestamp before building. Require `release.json.releasedAt` to be that
   timestamp in ISO 8601 UTC format with milliseconds, as produced from `SOURCE_DATE_EPOCH`. Record deployment
   wall-clock time separately; it is not `releasedAt`. Require the exact version and full commit revision in the
   compatibility release metadata used by both the static site and backend.
6. Validate and reload Nginx only if the compatibility static-artifact procedure requires it.
7. Do not write `SiteContent` records. When a record is absent, the application deliberately serves the reviewed
   checked-in default. Tyler's first separately authorized private save or publish through the owner workspace will
   create the managed record.

## Acceptance checks

1. Require `/healthz` and `/readyz` to return HTTP 200 with exactly `{ "ok": true }`.
2. Require public and backend release identity to match the exact tag and commit. Require `releasedAt` to equal the
   tagged commit timestamp derived from `SOURCE_DATE_EPOCH`, including milliseconds, and report deployment wall-clock
   time separately.
3. When `home-page` has no owner record, require `GET /api/site-content/home` to return seven showcase items in this
   order: The List, The Fall of a Dream, Exo Dexus, Bitgam, The Zlugnoid Hive Wars, Zetro and Retro, Explore the
   Artwork. Require each primary image path to use the existing `content/tyler-handdrawn-v1/` collection. If an owner
   record exists, preserve its public response and verify the seven-item checked-in default through isolated automated
   tests instead.
4. When `about-page` has no owner record, require `GET /api/site-content/about` to return **The List** labeled
   **Investigation arc** and **The Fall of a Dream** labeled **Rebellion arc**. If an owner record exists, preserve its
   public response and verify these checked-in defaults through isolated automated tests instead. Public defaults must
   present the story directly, without mentioning source notes, working files, draft status, final canon, or a
   relationship awaiting confirmation. Preserve source uncertainty by making no unsupported claim about the two arcs'
   sequence or continuity relationship.
5. When `characters-page` has no owner record, require `GET /api/site-content/characters` to return six character cards
   for Exo Dexus, Fazo, Shaman, Zetro, Fuzo, and Mozo and Zoha, plus nine world, faction, conflict, or technology
   entries. If an owner record exists, preserve its public response and verify these checked-in defaults through
   isolated automated tests instead. Do not accept the former invented role text for Zetro, Kazay, Exo, Shaman, or
   Zorix as fallback output.
6. Require `/worlds` to return the direct public Worlds page with four worlds, three conflicts or adventures, and four
   technology entries. Require `/artwork` to expose all 85 manifest-listed reviewed images, six category filters plus
   **All artwork**, a search control, the progressive **Show more artwork** control, and full-size image links. Confirm
   the seven excluded images and every other archive category remain absent.
7. From an authenticated owner session, verify **Edit the home page** loads and displays its preview and media-library
   controls without cropping. Do not save a live private draft, especially when `SiteContent` is absent and writes are
   prohibited. Require the isolated automated editor and backend draft tests to pass instead. Any live draft save
   requires separate explicit authorization plus documented database rollback instructions. Do not publish a test
   change.
8. Verify all 85 public image URLs return HTTP 200 with image content types. Require the five baseline URLs to match
   each entry's `storedSanitizedSha256`, and require every URL's bytes to match its own pre-deploy stored-byte hash.
   Verify fallback SVGs remain available, but confirm the public cards display the imported drawings. Do not compare
   the public bytes with `sourceSha256`.
9. Recheck the 85 imported media records and the pre-deploy upload invariants: content, path, stored sanitized hash,
   ownership, mode, ACLs, and file count. Require zero media-record, audit-import, or unrelated-content changes from
   deployment. A `ctime` refresh alone is permitted and is not evidence of a content change.
10. Recheck security headers, owner-route noindex behavior, unauthorized admin response, IPv4 and IPv6 public health,
   and the intended `www` redirect.

## Rollback and report

On any failed required check, automatically restore the backend, static site, and compatibility metadata from the
verified local pre-mutation artifact snapshot, restart the compatibility service, and rerun the same health and identity
checks. Do not roll back or alter the already imported media library.

Report:

- tag, full commit, package version, tagged-commit `releasedAt`, and separate deployment wall-clock time;
- pre-mutation snapshot identifier, checksums, restore result, and current artifact identifier;
- all build and test gate results;
- the 85-key gallery inventory identifier and pre/post hash equality result, plus detailed raw creative-source
  `sourceSha256`, live `storedSanitizedSha256`, record status, owner, group, mode, ACL state, and HTTP result for the five
  baseline entries;
- imported-media active count and remaining capacity;
- `SiteContent` metadata before and after, with explicit confirmation of whether defaults or owner records are active;
- homepage, Story, Characters, Worlds, Artwork, owner-editor, security-header, redirect, health, and readiness results;
- service restart count, rollback status, and confirmation that upload content, paths, hashes, ownership, modes, ACLs,
  file count, source archives, publication state, and unrelated content were unchanged. Report any permitted `ctime`
  refresh separately.
