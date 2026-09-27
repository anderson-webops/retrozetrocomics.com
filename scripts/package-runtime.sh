#!/usr/bin/env bash
# Build and accept an immutable RetroZetro production artifact on Linux ARM64.
set -euo pipefail

root=$(cd -- "$(dirname -- "$0")/.." && pwd -P)
cd -- "$root"
export RETROZETRO_RUNTIME_CONTRACT="$root/deploy/runtime-artifact.json"
test "$(id -u)" -ne 0
test "$(uname -s)" = Linux
test "$(uname -m)" = aarch64
test "$(node --version)" = v24.18.1
test "$(npm --version)" = 12.0.2
test -z "$(git status --porcelain)"
: "${RETROZETRO_ARTIFACT_MONGODB_URI:?Pass a loopback retrozetro_artifact_* MongoDB fixture URI}"

output=$(realpath "${1:?Pass an empty output directory under .ai-work/runs}")
case "$output/" in
  "$root/.ai-work/runs/"*) ;;
  *) echo "Output must be repository-owned .ai-work scratch." >&2; exit 1 ;;
esac

node <<'NODE'
const uri = new URL(process.env.RETROZETRO_ARTIFACT_MONGODB_URI)
if (uri.protocol !== "mongodb:") throw new Error("Artifact MongoDB must use mongodb://")
if (!["127.0.0.1", "localhost", "[::1]"].includes(uri.hostname)) {
  throw new Error("Artifact MongoDB must be loopback-only")
}
if (!/^artifact_[\w-]{2,55}$/.test(uri.username) || uri.password.length < 16) {
  throw new Error("Artifact MongoDB must use bounded synthetic credentials")
}
if (!/^\/retrozetro_artifact_[\w-]+$/.test(uri.pathname)) {
  throw new Error("Artifact MongoDB must use a dedicated retrozetro_artifact_* database")
}
NODE

builder_home="$output/.builder-home"
npm_cache="$output/.npm-cache"
builder_tmp="$output/.tmp"
if [[ "${RETROZETRO_BUILDER_ENV_CLEAN:-}" != 1 ]]; then
  test -z "$(find "$output" -mindepth 1 -maxdepth 1 -print -quit)"
  mkdir -m 0700 "$builder_home" "$npm_cache" "$builder_tmp"
  node_bin=$(realpath "$(command -v node)")
  clean_path="$(dirname -- "$node_bin"):/usr/local/bin:/usr/bin:/bin"
  exec /usr/bin/env -i \
    CI=1 \
    CYPRESS_INSTALL_BINARY=0 \
    HOME="$builder_home" \
    LANG=C.UTF-8 \
    NPM_CONFIG_CACHE="$npm_cache" \
    NPM_CONFIG_GLOBALCONFIG=/dev/null \
    NPM_CONFIG_USERCONFIG=/dev/null \
    PATH="$clean_path" \
    PUPPETEER_SKIP_DOWNLOAD=true \
    RETROZETRO_ARTIFACT_MONGODB_URI="$RETROZETRO_ARTIFACT_MONGODB_URI" \
    RETROZETRO_BUILDER_ENV_CLEAN=1 \
    RETROZETRO_RUNTIME_CONTRACT="$RETROZETRO_RUNTIME_CONTRACT" \
    TMPDIR="$builder_tmp" \
    TZ=UTC \
    /bin/bash "$root/scripts/package-runtime.sh" "$output"
fi
if [[ "$HOME" != "$builder_home" || "${NPM_CONFIG_USERCONFIG:-}" != /dev/null \
  || "${NPM_CONFIG_GLOBALCONFIG:-}" != /dev/null ]]; then
  echo "The release build must run inside its isolated environment." >&2
  exit 1
fi
unexpected_output=$(find "$output" -mindepth 1 -maxdepth 1 \
  ! -name .builder-home ! -name .npm-cache ! -name .tmp -print -quit)
test -z "$unexpected_output"
cleanup_builder_environment() {
  rm -rf -- "$builder_home" "$npm_cache" "$builder_tmp"
}
trap cleanup_builder_environment EXIT
unset RETROZETRO_BUILDER_ENV_CLEAN

for protected_environment in \
  /etc/retrozetro/retrozetro.env \
  /etc/backend-env/tyler-backend/tyler-backend.env \
  /etc/backend-env/tyler-backend/mongo.env; do
  if [[ -e "$protected_environment" && -r "$protected_environment" ]]; then
    echo "The release builder can read a protected production environment: $protected_environment" >&2
    exit 1
  fi
done
for runtime_group in retrozetro tyler site_retrozetro; do
  if getent group "$runtime_group" >/dev/null 2>&1 \
    && id -nG | tr ' ' '\n' | grep -Fxq "$runtime_group"; then
    echo "The release builder must not belong to runtime group $runtime_group." >&2
    exit 1
  fi
done

commit=$(git rev-parse HEAD)
version=$(node -p 'require("./package.json").version')
release="v$version"
prepared_at=$(date -u +%Y-%m-%dT%H:%M:%SZ)

export RETROZETRO_RELEASE_VERSION="$release"
export SOURCE_DATE_EPOCH
export SOURCE_REVISION="$commit"
SOURCE_DATE_EPOCH=$(git show -s --format=%ct HEAD)

npm ci --include=dev --include=optional --strict-allow-scripts --no-fund
npm run audit
npm run audit:production
npm run audit:signatures
npm run verify:dependency-graph
npm run verify:deploy-assets
npm run verify:install-scripts
npm run verify:native-lock
npm run lint
npm run typecheck
npm test
npm run test:runtime-artifact
npm run build
npm run verify:startup-diagnostics
npm run verify:production-install
npm run verify:direct-runtime
git diff --check

stage="$output/stage"
mkdir -p "$stage/front-end" "$stage/back-end" "$stage/node_modules"
install -m 0644 package.json package-lock.json "$stage/"
install -m 0644 front-end/package.json "$stage/front-end/"
install -m 0644 back-end/package.json "$stage/back-end/"
cp -R front-end/dist "$stage/front-end/"
cp -R back-end/dist "$stage/back-end/"
python3 -B scripts/copy-production-dependencies.py \
  "$root" "$stage/node_modules" > "$output/dependency-tree.txt"

argon_binding="$stage/node_modules/argon2/prebuilds/linux-arm64/argon2.armv8.glibc.node"
sharp_binding="$stage/node_modules/@img/sharp-linux-arm64/lib/sharp-linux-arm64-0.35.4.node"
sharp_library="$stage/node_modules/@img/sharp-libvips-linux-arm64/lib/libvips-cpp.so.8.18.6"
test -f "$argon_binding"
test -f "$sharp_binding"
test -f "$sharp_library"
find "$stage/node_modules/argon2/prebuilds" -type f \
  ! -path "$argon_binding" -delete
find "$stage/node_modules/argon2/prebuilds" -depth -type d -empty -delete

find "$stage" -type d -exec chmod 0755 {} +
find "$stage" -type f -exec chmod 0644 {} +
if find "$stage" -type l -print -quit | grep -q .; then
  echo "Runtime stage contains a symbolic link." >&2
  exit 1
fi
node scripts/write-runtime-identity.mjs \
  "$stage" "$commit" "$release" "$prepared_at"
npm audit --prefix "$stage" --omit=dev --audit-level=low

archive="$output/retrozetro-$release-${commit:0:12}-linux-arm64.tar.gz"
python3 -B scripts/runtime-artifact.py pack \
  "$stage" --archive "$archive" --commit "$commit" > "$output/pack.json"
sha=$(sha256sum "$archive" | cut -d ' ' -f 1)
printf '%s  %s\n' "$sha" "$(basename "$archive")" > "$output/SHA256SUMS"
cp "$stage/runtime-manifest.json" "$output/runtime-manifest.json"

mkdir "$output/unpacked"
python3 -B scripts/runtime-artifact.py unpack "$output/unpacked" \
  --archive "$archive" --sha256 "$sha" --commit "$commit"
bash scripts/test-unpacked-artifact.sh "$output/unpacked"

cp -R "$output/unpacked" "$output/copied"
python3 -B scripts/runtime-artifact.py verify "$output/copied" \
  --archive "$archive" --sha256 "$sha" --commit "$commit"
bash scripts/test-unpacked-artifact.sh "$output/copied"
rm -- "$output/copied/back-end/dist/app.js"
if python3 -B scripts/runtime-artifact.py verify "$output/copied" \
  --archive "$archive" --sha256 "$sha" --commit "$commit"; then
  echo "Missing runtime module was incorrectly accepted." >&2
  exit 1
fi
bash scripts/test-unpacked-artifact.sh "$output/copied" missing-module

python3 -B - "$output" <<'PY'
import datetime
import hashlib
import json
from pathlib import Path
import sys

output = Path(sys.argv[1])
receipt = json.loads((output / "pack.json").read_text())
receipt["acceptedAt"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
receipt["bytes"] = (output / receipt["archive"]).stat().st_size
receipt["checks"] = [
    "secret-inaccessible unprivileged builder",
    "isolated builder home, environment, and npm configuration",
    "clean locked Linux ARM64 build",
    "full and production dependency audits",
    "registry signatures",
    "explicit required paths and complete file hashes",
    "root-lock-backed backend production closure",
    "reviewed Argon2, Sharp, and libvips native inventory",
    "compiled administrator recovery entrypoint",
    "isolated unpacked runtime without source or development dependencies",
    "minimal health and readiness probes",
    "dependency failure",
    "published storefront",
    "graceful shutdown",
    "post-copier verification",
    "missing-module rejection",
]
receipt["harnessSha256"] = {
    name: hashlib.sha256(Path(name).read_bytes()).hexdigest()
    for name in [
        "deploy/runtime-artifact.json",
        "scripts/runtime-artifact.py",
        "scripts/copy-production-dependencies.py",
        "scripts/package-runtime.sh",
        "scripts/test-unpacked-artifact.sh",
        "scripts/artifact-acceptance.mjs",
        "scripts/write-runtime-identity.mjs",
        "deploy/systemd/promote-release.sh",
        "deploy/systemd/install-service.sh",
    ]
}
(output / "acceptance.json").write_text(
    json.dumps(receipt, indent=2, sort_keys=True) + "\n"
)
PY

rm -rf -- "$stage" "$output/unpacked" "$output/copied"
echo "Exact unpacked RetroZetro artifact accepted: $archive"
