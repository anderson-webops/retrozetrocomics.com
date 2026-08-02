#!/usr/bin/env bash
set -euo pipefail

system_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
node_bin_dir="${NODE_BIN_DIR:-/usr/bin}"
if [[ "$node_bin_dir" != /* ]] || [[ ! -x "$node_bin_dir/node" ]] || [[ ! -x "$node_bin_dir/npm" ]]; then
	echo "NODE_BIN_DIR must be an absolute directory containing executable node and npm binaries." >&2
	exit 1
fi
node_bin_dir_real="$(cd -- "$node_bin_dir" && pwd -P)"
PATH="$node_bin_dir_real:$system_path"
export PATH
unset npm_config_global_ignore_file NPM_CONFIG_GLOBAL_IGNORE_FILE
export CYPRESS_INSTALL_BINARY=0
export PUPPETEER_SKIP_DOWNLOAD=true

release_root="${RELEASE_ROOT:-/srv/retrozetro/releases}"

if [[ $# -ne 1 ]]; then
	echo "Usage: prepare-release.sh /srv/retrozetro/releases/<release>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
	echo "Prepare releases as the unprivileged retrozetro deployment user, not root." >&2
	exit 1
fi

release_root_real="$(cd -- "$release_root" && pwd -P)"
candidate="$(cd -- "$1" && pwd -P)"
case "$candidate/" in
	"$release_root_real/"*) ;;
	*) echo "Candidate must resolve beneath $release_root_real: $candidate" >&2; exit 1 ;;
esac
if [[ "$candidate" == "$release_root_real" ]]; then
	echo "Candidate must be a release checkout beneath, not equal to, $release_root_real." >&2
	exit 1
fi
if [[ ! -f "$candidate/package-lock.json" ]] || ! git -C "$candidate" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Candidate must be a complete Git checkout with the committed root lockfile." >&2
	exit 1
fi
if [[ -n "$(git -C "$candidate" status --porcelain)" ]]; then
	echo "Candidate checkout must be clean before preparation." >&2
	exit 1
fi
if [[ "$(node --version)" != "v24.18.1" || "$(npm --version)" != "12.0.2" ]]; then
	echo "Preparation requires Node 24.18.1 and npm 12.0.2." >&2
	exit 1
fi

export RETROZETRO_COMMIT_SHA="$(git -C "$candidate" rev-parse HEAD)"
export SOURCE_DATE_EPOCH="$(git -C "$candidate" show -s --format=%ct HEAD)"
export SOURCE_REVISION="$RETROZETRO_COMMIT_SHA"
unset NODE_ENV

cd -- "$candidate"
export RETROZETRO_RELEASE_VERSION="v$(node -p "require('./package.json').version")"
if [[ "$(git cat-file -t "refs/tags/$RETROZETRO_RELEASE_VERSION" 2>/dev/null || true)" != "tag" ]]; then
	echo "Release preparation requires the matching annotated tag $RETROZETRO_RELEASE_VERSION." >&2
	exit 1
fi
if [[ "$(git rev-parse "refs/tags/$RETROZETRO_RELEASE_VERSION^{}")" != "$RETROZETRO_COMMIT_SHA" ]]; then
	echo "The release tag must peel to the exact candidate revision." >&2
	exit 1
fi
if ! git show-ref --verify --quiet refs/remotes/origin/main \
	|| [[ "$(git rev-parse refs/remotes/origin/main)" != "$RETROZETRO_COMMIT_SHA" ]]; then
	echo "The release candidate must be the exact fetched origin/main revision." >&2
	exit 1
fi
npm ci --include=dev --include=optional --strict-allow-scripts
npm run audit
npm run audit:production
npm run audit:signatures
npm run verify:dependency-graph
npm run verify:deploy-assets
npm run verify:install-scripts
npm run verify:native-lock
npm run verify:platform-install
npm run lint
npm run typecheck
npm test
npm run build
npm run a11y
npm run verify:production-install
git diff --check

node - <<'NODE'
import { readFileSync, writeFileSync } from "node:fs";
import rootPackage from "./package.json" with { type: "json" };

const release = JSON.parse(readFileSync("front-end/dist/release.json", "utf8"));
if (
	release.version !== rootPackage.version
	|| release.revision !== process.env.RETROZETRO_COMMIT_SHA
) {
	throw new Error("Built release identity does not match the candidate source.");
}
writeFileSync(".retrozetro-release-prepared.json", `${JSON.stringify({
	commitSha: process.env.RETROZETRO_COMMIT_SHA,
	preparedAt: new Date().toISOString(),
	release: `v${rootPackage.version}`
}, null, 2)}\n`, { mode: 0o644 });
NODE

npm ci \
	--include=prod \
	--omit=dev \
	--omit=optional \
	--workspace back-end \
	--include-workspace-root=false \
	--ignore-scripts \
	--no-audit \
	--no-fund
npm rebuild argon2 --workspace back-end --foreground-scripts --no-audit --no-fund
npm audit --include=prod --omit=dev --omit=optional --workspace back-end --audit-level=high
npm prune \
	--include=prod \
	--omit=dev \
	--omit=optional \
	--workspace back-end \
	--include-workspace-root=false \
	--no-audit \
	--no-fund
node - <<'NODE'
const { rmSync } = require("node:fs");
const { join } = require("node:path");
for (const packageName of ["typescript", "tsx", "esbuild", "vite", "vitest"]) {
	for (const modulesRoot of ["node_modules", "back-end/node_modules"]) {
		rmSync(join(modulesRoot, packageName), { force: true, recursive: true });
		rmSync(join(modulesRoot, ".bin", packageName), { force: true, recursive: true });
	}
}
NODE
node --input-type=module - <<'NODE'
import argon2 from "argon2";

const value = "retrozetro-direct-runtime";
const hash = await argon2.hash(value);
if (!(await argon2.verify(hash, value))) {
	throw new Error("The production Argon2 binding failed verification.");
}
await import("./back-end/dist/app.js");
NODE

echo "Prepared direct runtime release $candidate at $RETROZETRO_COMMIT_SHA."
