# Repository Guidelines

## Standing Dependency Completion Policy

Treat dependency remediation as part of completing authorized work on this
site, not as an optional follow-up. Proactively resolve vulnerabilities,
compatibility problems, broken installations and lockfile issues. Cover direct
and transitive dependencies, production and development dependencies,
workspaces and root-level tools. Do not dismiss findings because they are
pre-existing or development-only.

Before creating a release tag or publishing a release, require a clean locked
installation for every applicable dependency graph, zero known dependency
vulnerabilities in both full and production audits, and all applicable project
checks. An unavailable or incomplete audit is not a clean result. Use supported
upgrades, replacements or maintainable patches that preserve functionality.
Do not silence findings, weaken checks or force incompatible versions merely
to obtain a passing result.

Intermediate commits may capture coherent progress. Commit and push validated
work through this site's authorized delivery process, and complete meaningful
releases rather than stopping after reporting fixable dependency blockers.
Documentation-only housekeeping does not require an application release.

Preserve unrelated work, coordinate with other active chats, and retain existing
security, approval and production-access boundaries. Existing maintenance pauses
and repository exclusions remain in force; this policy does not expand access
or authorize otherwise excluded work. If a genuine blocker prevents completion,
preserve progress and report the exact blocker and remaining work. Distinguish
a published release from verified live deployment.

Treat this as a standing instruction for this site.

Shared Sites policy (`../AGENTS.md` when available) applies. These essentials also apply in standalone checkouts:
- Keep server-AI and operator handoffs only in ignored `.ai-work/server-instructions/`; never commit, push, tag, release, or package them. Public runtime contracts may remain tracked.
- Never SSH, SCP, SFTP, tunnel to, or configure access to production. Do not deploy it; protected server-side automation owns activation, and source delivery alone does not prove deployment.
- GitGuardian quota, authentication, network, or service failure is not a commit/push blocker. Review outgoing changes, run another available local secret scan, preserve other hooks, and stop on real secret findings.
- Commit small, coherent, validated changes frequently as work progresses and push completed work through this repository's authorized source path, usually its default branch; use pull requests only when required.
- Group related changes into meaningful deployable milestones. Align version metadata, create a new immutable annotated semver tag, and publish its matching verified GitHub release with the required accepted artifacts.
- Complete finished deployable work through the published release consumed by protected deployment. Independently verify public release identity and acceptance read-only, or report the exact remaining blocker. Never move published tags or replace published release assets.

## Project Structure & Module Organization

- `front-end/` hosts the Vite-powered Vue 3 client. Routing views live in `src/pages`, shared UI in `src/components`,
  state in `src/stores`, and feature logic in `src/modules`. Static assets belong in `public/`, while
  i18n copy sits under `front-end/locales/`.
- Front-end unit specs reside in `front-end/test/*.spec.test.ts` (snapshots in `__snapshots__/`). End-to-end workflows
  live in `front-end/cypress/`.
- `back-end/` contains the Express + Mongoose API. Keep request handling in `src/controllers/`, validation in
  `src/middleware/`, schemas in `src/models/`, and route wiring under `src/routes/`.
- Monorepo-wide configuration (ESLint, TypeScript base config, workspace scripts) is defined at the repository root;
  update these when adjusting tooling for either project.

## Build, Test, and Development Commands

- `npm ci` (root) installs the committed workspace lockfile using the pinned `npm@12` toolchain. Avoid mixing package
  managers.
- `npm run dev` starts the front-end dev server on port 3333; `npm run serve` runs the same build with `--host` enabled
  for LAN previews.
- `npm run server` launches the API with live reload via `tsx watch -r dotenv/config` on port 3008.
- `npm run build` produces optimized client + server bundles (`front-end/dist/`, `back-end/dist/`).
- `npm run -w front-end test` and `npm run -w front-end test:unit` run Vitest. For the maintained Cypress specs, use `npm exec -w front-end -- cypress run`; this workspace has no `test:e2e` script.
- `npm run lint` (or `lint-fix`) runs the shared ESLint configuration across both workspaces. The repository configures
  `lint-staged` through `simple-git-hooks`; verify that the local hook runs when a global hooks path is configured.

## Coding Style & Naming Conventions

- ESLint extends `@antfu/eslint-config` and enforces Prettier with tab indentation, double quotes, semicolons,
  120-character lines, and LF endings. Run `npm run lint-fix` before pushing.
- Vue single-file components use PascalCase filenames (`TheHeader.vue`), composables use the `useFeature` pattern, and
  Pinia stores live in `src/stores/`.
- TypeScript modules should export camelCase functions and PascalCase classes/types. Keep front-end route files
  lowercase to match the generated router.

## Testing Guidelines

- Write unit tests with Vitest and follow the `*.spec.test.ts` naming used in `front-end/test/`. Snapshot updates belong
  in `__snapshots__/` and should be reviewed line-by-line.
- Cypress specs should stub network calls against the Express test server; store fixtures under
  `front-end/cypress/fixtures/`.
- Back-end Vitest suites live in `back-end/test/`; run them with `npm run -w back-end test`.
- Aim to cover new endpoints, Pinia stores, and critical user flows before delivery; document any intentionally skipped
  scenarios in the final handoff and in any required pull request.

## Security & Configuration Tips

- The API expects non-placeholder 32+ character secrets, HTTPS-only production origins, authenticated MongoDB with TLS
  away from literal loopback, and either `MONGODB_URI` or fully configured Vault. Production trusts only exact loopback
  values in `TRUSTED_PROXY_IPS`; numeric proxy-hop trust is unsupported. Load secrets through excluded environment files.
- `npm run server` already loads `dotenv/config` and will attempt Vault retrieval via `src/vaultClient.ts`; validate
  both code paths when changing auth or persistence.
- Never commit real credentials or production endpoints. Scrub logs before sharing, and verify rate limiting when
  exposing new administrative or other sensitive routes.


## Release Scope
- This repo follows the stable `v2.x` line. Stay on `v2` for routine work; only cut `v3` for an intentional breaking site or API change.
- Comic/catalog browsing, storefront behavior, content structure, dependency security, and deploy/health behavior are release-worthy when deployable.

## Dependency & Lockfile Discipline

- Keep the application workspaces on the sole root `package-lock.json`; nested application locks and pnpm workspaces are unsupported. The independently versioned, build-only SDK under `vendor/webops-build-tools/` retains its exact canonical installation and compatibility-audit locks. Verify its complete `CANONICAL.json` input inventory and run `scripts/build-tools.mjs --check`, `--audit`, `--audit-production` and `--audit-signatures` alongside the application gates. Keep SDK installations and package managers out of production archives.
- For dependency changes, review production and development packages, run a clean locked application installation and both audits including the workspace root, then the relevant lint, type, test, build and native artifact gates. Regenerate and include the root lockfile when application manifests drift. Each independent SDK graph must also have complete zero-finding full and production audits; an application-only clean result is insufficient.

## Checked Direct Delivery

- When repository policy requires pre-integration CI or CodeQL checks, validate a candidate on a `codex/` branch, then integrate only the exact validated commit and remove the branch. Revalidate if the default branch advances; never bypass failing required checks.
- CI and CodeQL run automatically for pull requests and merged `main`. For a direct-delivery candidate without a pull request, dispatch both workflows against its `codex/` branch and verify their exact checked revision before integration. Both workflows retain supported manual dispatch; avoid duplicate branch-push and pull-request runs.
