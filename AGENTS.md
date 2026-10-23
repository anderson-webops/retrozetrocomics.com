# Repository Guidelines

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

- Keep only the root `package-lock.json` aligned with every workspace manifest; nested locks and pnpm workspaces are unsupported. For dependency changes, review both production and development packages, run a clean root `npm ci` (not an install fallback), full and production audits, and relevant lint, type, test, and build gates. Regenerate and include the lockfile if it drifts.

## Checked Direct Delivery

- When repository policy requires pre-integration CI or CodeQL checks, validate a candidate on a `codex/` branch, then integrate only the exact validated commit and remove the branch. Revalidate if the default branch advances; never bypass failing required checks.
