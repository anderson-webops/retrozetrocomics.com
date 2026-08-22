# Tyler source-backed site content handoff

Install the exact annotated release tag supplied by Jacob. Follow this file as the scope authority for the content
activation. Do not infer additional canon or publish any source archive document.

## Intended result

- The public home page uses the five existing imported hand-drawn images listed in
  `deploy/content/tyler-site-content-v1.json`.
- The public story and character defaults use Tyler-supported descriptions and openly label unresolved continuity.
- The owner workspace includes **Edit the home page**, with private drafts, preview, media-library selection,
  publication confirmation, and revision recovery.
- Existing owner-authored `SiteContent` records remain authoritative and are never overwritten automatically.
- The existing 85 media records and files remain in place. This release uploads, moves, deletes, or transforms no media.

## Actual deployment profile

This handoff explicitly supports the audited compatibility deployment unless the server has already completed a
separately reviewed migration to the canonical direct-release service:

- service: `tyler-backend.service`
- account: `tyler:tyler`
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
3. Read `deploy/content/tyler-site-content-v1.json`. Verify its five files beneath the upload root by exact SHA-256,
   regular-file type, owner `tyler:tyler`, mode `0600`, and path containment. Do not repair, rename, or replace a
   mismatch during this deployment.
4. Through a confined read-only process that loads the protected environment through systemd PID 1, verify:
   - exactly 85 active `MediaAsset` records remain under `content/tyler-handdrawn-v1/`;
   - all five referenced storage keys have active image records with provider `local`;
   - media capacity remains within the 120-item limit;
   - metadata for `home-page`, `about-page`, and `characters-page`, including record existence, published version,
     draft presence, and timestamps. Do not read or print content-bearing fields merely to establish this gate.
5. Expect those three `SiteContent` records to be absent based on the last verified state. If any record now exists,
   preserve it. Report which checked-in defaults it overrides, and do not seed, replace, merge, or publish it.
6. Record pre-deploy release identity, service status, `/healthz`, `/readyz`, media counts, relevant content-record
   metadata, and hashes for the five referenced files. Do not create an upload backup because this release has no
   upload write path. Use the established database backup procedure only if an unexpected database write becomes
   necessary, and stop for explicit approval before that write.

## Deployment

1. Build and stage the exact tagged artifact away from the live backend and static roots.
2. Preserve the protected environment files, upload tree, ownership model, service confinement, and Nginx rules.
3. Install the backend and static artifact using the server's established atomic compatibility-release procedure.
   Keep a complete immediately previous artifact for rollback. Never place secrets or uploads inside the release.
4. Write exact version, full commit revision, and deployment timestamp into the compatibility release metadata used by
   both the static site and backend. Restart only `tyler-backend.service`, then validate and reload Nginx if the static
   artifact procedure requires it.
5. Do not write `SiteContent` records. When a record is absent, the application deliberately serves the reviewed
   checked-in default. Tyler's first private save or publish through the owner workspace will create the managed record.

## Acceptance checks

1. Require `/healthz` and `/readyz` to return HTTP 200 with exactly `{ "ok": true }`.
2. Require public and backend release identity to match the exact tag and commit.
3. Require `GET /api/site-content/home` to return four showcase items in this order: The List, The Fall of a Dream,
   Exo Dexus, Bitgam. Require each primary image path to match the manifest.
4. Require `GET /api/site-content/about` to return two items labeled **Working story file** and to state that their
   exact relationship remains for Tyler to confirm.
5. Require `GET /api/site-content/characters` to return Exo Dexus and Fazo plus five source-backed world or faction
   entries. Do not accept the former invented role text for Zetro, Kazay, Exo, Shaman, or Zorix as fallback output.
6. From an authenticated owner session, verify **Edit the home page** loads, selects an existing image, saves a private
   draft without changing the public API, previews without cropping, and presents a separate publication confirmation.
   Discard the test draft or restore the exact pre-test state. Do not publish a test change.
7. Verify the five public image URLs return HTTP 200 with image content types. Verify fallback SVGs remain available,
   but confirm the public cards display the imported drawings.
8. Recheck the 85 imported media records and five file hashes. Require zero media, upload-tree, audit-import, or
   unrelated-content changes from deployment.
9. Recheck security headers, owner-route noindex behavior, unauthorized admin response, IPv4 and IPv6 public health,
   and the intended `www` redirect.

## Rollback and report

On any failed required check, atomically restore the previous backend and static artifact, restart the compatibility
service, and rerun the same health and identity checks. Do not roll back or alter the already imported media library.

Report:

- tag, full commit, package version, and deployed timestamp;
- previous and current artifact identifiers;
- all build and test gate results;
- five storage keys, SHA-256 results, record status, owner, mode, and HTTP result;
- imported-media active count and remaining capacity;
- `SiteContent` metadata before and after, with explicit confirmation of whether defaults or owner records are active;
- homepage, about, characters, owner-editor, security-header, redirect, health, and readiness results;
- service restart count, rollback status, and confirmation that uploads, source archives, publication state, and
  unrelated content were unchanged.
