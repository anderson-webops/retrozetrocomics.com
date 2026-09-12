# Tyler publishing workflow handoff: v2.9.0

This is a deployment procedure, not authorization to deploy. Once Jacob authorizes server installation, install the
exact annotated `v2.9.0` tag. Do not infer additional canon or publish any source archive document.

## Publishing additions in this release

- `/start` follows the published story order. Story pages include previous/next navigation and optional on-device
  reading-place controls. New stories are appended; owner ordering remains a private draft until publication.
- `/search` searches existing published text and captions, including source-backed Worlds entries. Results render
  without JavaScript, use noindex, and stay outside the sitemap. No search service, accounts or analytics are added.
- Owners can create dedicated story and chapter URLs, change section headings, write longer passages, choose opening
  and section illustrations, reorder sections, and preview the complete reading page. Existing outline fields remain.
- The gallery is an editable `artwork-page` document with selection from the existing media library, captions, categories,
  reading links, ordering, private drafts, publication, trash, and revision recovery. The absent-record default remains
  the same 85 reviewed images. Removing a gallery entry does not remove its media file.
- Public HTML, metadata, and the sitemap are rendered from validated published content at request time. The browser
  receives that same public snapshot. Drafts and account information are excluded. No static rebuild or file write
  occurs when an owner publishes. Invalid data or unavailable MongoDB returns an unavailable response, never stale defaults.
- The build now also produces `back-end/dist/public-renderer/`. Deploy that entire directory and all frontend assets.
  `npm run build` runs `verify:publishing`; production-only installation also checks the compiled renderer.
- An additive `editVersion` counter prevents outdated guided-editor saves and publication from replacing newer work.
  Existing documents without the counter remain readable. The counter is added only on an authorized future write.
- Chapter approval and testing with Tyler are separate human steps. Private chapter proofs, questionnaires, raw source
  messages, and practice content must never be copied into the public artifact or automatically seeded.

## Preserved public content and boundaries

- The public home page presents seven story, character, world, and artwork highlights using existing imported
  hand-drawn images.
- The public Story and Characters pages carry expanded direct descriptions, while the new Worlds page presents four
  worlds, three conflicts or adventures, and four technology entries.
- Two illustrated reading pages expose all seven editable story sections for The List and The Fall of a Dream.
  Characters expands to twelve profiles, with optional longer biographies and text-only entries where no portrait
  is confidently identified. The nine wider-Retroverse entries remain on Characters; their editing tools remain on
  Story but the duplicate visitor section is removed.
- The new Artwork page presents the exact 85 reviewed hand-drawn images listed in
  `deploy/content/tyler-site-content-v1.json`, with filters and full-size views. All 85 image links are in the initial
  HTML; no Show More interaction is needed. Ten confidently matched drawings link to related stories or profiles.
- The Home showcase, Worlds collections, and Artwork gallery use the continuous muted dark Retroverse palette.
  Paper tones remain limited to bounded artwork frames. The three empty ad placements are commented out in
  `front-end/src/layouts/default.vue`, with restoration instructions; their component and styles remain available.
  Do not uncomment them during this deployment.
- Creator and Privacy pages are linked in the footer. Optional analytics and ad scripts are disabled, while the
  AdSense verification metadata and ads.txt remain. Advertising must not be enabled by this handoff.
- Generated HTML now carries route-specific titles, descriptions, and canonical URLs, checked during every build.
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
   - metadata for `home-page`, `about-page`, `characters-page`, and `artwork-page`, including record existence, published version,
     draft presence, and timestamps. Do not read or print content-bearing fields merely to establish this gate.
6. Recheck record presence; do not assume the historical absent-record state still holds. If any record now exists,
   preserve it. Report which checked-in defaults it overrides, and do not seed, replace, merge, or publish it.
   The build still verifies its source defaults in isolation. Production document requests must reach the Node renderer,
   which reads current published records. Existing owner overrides are expected and do not require rebuilding or
   exporting drafts. If a published record fails validation, report the affected page without printing its private
   draft and stop before promotion for repair instructions. Do not alter the record automatically.
7. Record pre-deploy release identity, service status, `/healthz`, `/readyz`, media counts, relevant content-record
   metadata, all 85 storage keys and stored-byte hashes, and `storedSanitizedSha256` results for the five baseline
   files. Record a pre-deploy upload inventory whose invariants are content, path, hash, ownership, mode, ACLs, and file
   count. Do not require upload `ctime` to remain unchanged because the server's `site-perms` process may legitimately
   refresh it. Do not create an upload
   backup because this release has no upload write path. Use the established database backup procedure only if an
   unexpected database write becomes necessary, and stop for explicit approval before that write.

## Deployment

1. Build and stage the exact tagged artifact away from the live backend and static roots. Coordinate an owner editing
   pause through installation and acceptance so no new-schema content is written during the rollback window.
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
6. Verify Nginx forwards `/`, `/start`, `/search`, `/about`, `/characters`, `/artwork`, `/worlds`, `/contact`, `/creator`, `/privacy`,
   `/stories/` and `/sitemap.xml` to the backend, including trailing-slash forms. The checked Nginx locations file
   already proxies these requests. If the live server instead uses static `try_files` for documents, adjust those
   document locations as part of this compatibility deployment, snapshot the prior Nginx configuration, validate
   with `nginx -t`, and reload. Assets and uploads may retain existing delivery. Do not enable a proxy/CDN page cache.
   Preserve the application's per-response CSP including its nonce; do not replace it with a fixed broad header.
   Include any changed proxy configuration in the automatic local restore procedure.
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
5. When `characters-page` has no owner record, require `GET /api/site-content/characters` to return twelve character cards
   for Exo Dexus, Fazo, Shaman, Zetro, Fuzo, Mozo and Zoha, Giza, Oix, Diyo, Pexus and the impostor, Zego, and Zorix,
   plus nine world, faction, conflict, or technology
   entries. If an owner record exists, preserve its public response and verify these checked-in defaults through
   isolated automated tests instead. Do not accept the former invented role text for Zetro, Kazay, Exo, Shaman, or
   Zorix as fallback output. On Characters, require the recognized entries to begin with Apex Army,
   Team Rimlaw and the Star Hunters, and Zego Order; then Bitgam, Galgri and the Galnoids, and the Council of Orpex;
   then the Zlugnoid Hive Wars, Linkpods and CBots, and FZ and Oddverse. Require Apex Army, Bitgam, and the Zlugnoid
   Hive Wars to be full-width lead cards above their paired related cards on desktop and require a single readable
   column with no horizontal overflow on mobile. Preserve any owner-created entries after these recognized entries.
6. Require `/worlds` to return the direct public Worlds page with four worlds, three conflicts or adventures, and four
   technology entries. When `artwork-page` is absent, require `/artwork` to expose all 85 manifest-listed reviewed images, six category filters plus
   **All artwork**, a search control, and all 85 full-size image links in the initial HTML without JavaScript. Confirm
   the seven excluded images and every other archive category remain absent from the defaults. When an owner gallery
   record exists, require its published items, captions, links and order to appear instead; preserve its content.
7. At desktop and phone widths, require the home showcase, both Worlds collection sections, and Artwork gallery to use
   the muted dark palette. Reject the former bright full-section paper background. Require no rendered empty
   advertisement placements or reserved blank ad columns; preserve their commented source for future reinstatement.
   Require the seventh home showcase card to span the final desktop row and return to one column on phones.
   Worlds collections use two columns above 900px and one column below. Confirm
   missing-image text remains readable, controls retain rounded corners, and no public route develops horizontal
   overflow. Do not require loaded hand-drawn images themselves to be darkened or transformed.
8. From an authenticated owner session, verify **Edit the home page**, **Edit the artwork gallery**, and the story
   editor load. Verify section heading, prose, picture, order, preview and recovery controls, plus media-library
   controls without cropping. Do not save a live private draft, especially when `SiteContent` is absent and writes are
   prohibited. Require the isolated automated editor and backend draft tests to pass instead. Any live draft save
   requires separate explicit authorization plus documented database rollback instructions. Do not publish a test
   change.
9. Verify all 85 public image URLs return HTTP 200 with image content types. Require the five baseline URLs to match
   each entry's `storedSanitizedSha256`, and require every URL's bytes to match its own pre-deploy stored-byte hash.
   Verify fallback SVGs remain available, but confirm the public cards display the imported drawings. Do not compare
   the public bytes with `sourceSha256`.
10. Recheck the 85 imported media records and the pre-deploy upload invariants: content, path, stored sanitized hash,
   ownership, mode, ACLs, and file count. Require zero media-record, audit-import, or unrelated-content changes from
   deployment. A `ctime` refresh alone is permitted and is not evidence of a content change.
11. Recheck security headers, owner-route noindex behavior, unauthorized admin response, IPv4 and IPv6 public health,
   and the intended `www` redirect.
12. Require all ten `publicRoutes` in the manifest to return their own content, unique title, description, canonical URL,
   and sitemap entry. Run `node scripts/verify-public-html.mjs` against the exact staged build and compare served HTML
   to it. `/stories` must lead to the Story index rather than an empty parent route; it is not in the sitemap.
   Both reading routes must contain seven story sections and a contents navigation. Follow a contents link and the
   links back to the index, characters, and artwork. Check source outline separation against `READER_RELEASE_REVIEW.md`.
13. Verify Privacy describes the actual server/mail configuration and that no optional advertising or analytics
   scripts are injected by Nginx or another layer. Confirm creator/privacy footer links, essential owner login and
   local-draft behavior, and text-only character editing with the isolated tests. Any future ads/analytics activation
   needs a separate privacy/consent review and authorization. AdSense approval is not an acceptance claim.

## Publishing synchronization acceptance

- Require `/start` and previous/next links to follow current published story order. Verify the search form with an
  existing public name; results must link to actual story, character, world and artwork targets. Preserve query strings
  when proxying `/search`. Require noindex on search responses and exclusion of `/search` from the sitemap.
- The optional saved place writes only a story/section identifier to the visitor's local browser after an explicit
  click. Test save, reload, resume, removal, and unavailable storage in isolation. Do not use owner credentials for a
  reader test. No live content save, media change, new database collection or server migration is needed for this feature.
- Read only public API data for comparison with raw HTTP HTML, without executing JavaScript. Compare story headings,
  passages, illustration URLs, gallery captions and order. Titles and canonical URLs must match each reading route.
- Every currently published story address appears in `/sitemap.xml`; owner and draft-only routes do not. An unknown
  story returns HTTP 404 with noindex. Public HTML and content API responses use `Cache-Control: no-store`.
- Check the renderer's per-response nonce matches every inline script and the CSP header. Confirm styles and images
  display with JavaScript disabled, and normal browser navigation retains the same published content.
- Run the isolated publishing tests: changed and removed stories, gallery updates, private draft invisibility,
  stale-edit rejection, revision recovery to draft, script escaping, and concurrent renderer request isolation.
  The direct-runtime smoke test deliberately has no database and now expects public HTML to return 503.
- Do not perform a live save or publication to prove synchronization. Use existing published content and isolated tests.

## Rollback and report

After owners begin publishing new reading sections or gallery content, a downgrade to v2.8.0 cannot represent all
new fields. Prefer a forward fix. Any later database rollback or conversion needs a separately reviewed recovery plan
and explicit authorization; do not silently downgrade and discard the owner's newer work.


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
