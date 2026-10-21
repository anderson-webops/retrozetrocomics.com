# Dependency reconciliation for v2.10.2

Combines the production and development updates proposed in #74 and #75, including Vite 8.3.4 from #77, and refreshes postcss-selector-parser beyond #76's patched version. Rebuilds the root workspace lockfile with Node 24.18.1 and npm 12.0.2.

The layout plugin moves to 3.3.1 to remove the vulnerable fast-glob/micromatch path. The unused vite-plugin-pages dependency is removed; routing continues through vue-router's existing Vite integration. The upstream layout plugin 3.3.1 is retained locally with its MIT license and a one-line named-import compatibility patch for brace-expansion 5.0.12; vulnerable v3 is removed. Isolated install fixtures copy this small vendor directory. Scoped security updates select follow-redirects 1.16.1, js-yaml 4.3.2, tinypool 2.2.0, and KaTeX 0.19.0. Linux native-package pins and the exact install-script allowlist match the regenerated lockfile. Mongoose's admin model receives its inferred schema type directly, preserving the typed model contract with 9.11.2.

Validation before publication: clean root npm ci with optional dependencies and strict install-script policy, lint, frontend/backend type checks, 39 frontend tests, 78 backend tests, and client/server/SSR build with publishing verification passed. Full and production audits must remain clean, and the candidate must pass CI and CodeQL, including Linux ARM64 immutable runtime acceptance, before integration.

This is source delivery. It does not rotate credentials or perform production deployment. Existing Vue Router navigation guards emit a deprecation warning; their behavior is unchanged and covered by tests.
