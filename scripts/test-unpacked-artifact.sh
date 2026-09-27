#!/usr/bin/env bash
set -euo pipefail

artifact=$(realpath "${1:?Pass the exact unpacked artifact directory}")
case_name=${2:-complete}
[[ "$case_name" == complete || "$case_name" == missing-module ]]
script_dir=$(cd -- "$(dirname -- "$0")" && pwd -P)
node=$(realpath "$(command -v node)")

test "$(id -u)" -ne 0
test "$(uname -s)" = Linux
test "$(uname -m)" = aarch64
test "$("$node" --version)" = v24.18.1
command -v bwrap >/dev/null
command -v timeout >/dev/null

if [[ "$case_name" == complete ]]; then
  : "${RETROZETRO_ARTIFACT_MONGODB_URI:?Pass a loopback retrozetro_artifact_* MongoDB fixture URI}"
  python3 -B "$script_dir/runtime-artifact.py" verify "$artifact"
fi

mounts=(
  --ro-bind /usr /usr
  --proc /proc
  --dev /dev
  --tmpfs /tmp
  --tmpfs /state
)
for directory in /lib /lib64; do
  if [[ -e "$directory" ]]; then
    mounts+=(--ro-bind "$directory" "$directory")
  fi
done

timeout -k 5 90 bwrap \
  --unshare-user --unshare-pid --unshare-uts --unshare-ipc --unshare-cgroup \
  --die-with-parent --new-session \
  "${mounts[@]}" \
  --ro-bind "$node" /runtime/node \
  --ro-bind "$artifact" /app \
  --ro-bind "$script_dir/artifact-acceptance.mjs" /harness/artifact-acceptance.mjs \
  --clearenv \
  --setenv HOME /tmp \
  --setenv PATH /runtime:/usr/bin:/bin \
  --setenv RETROZETRO_ARTIFACT_MONGODB_URI "${RETROZETRO_ARTIFACT_MONGODB_URI:-}" \
  --chdir /app \
  /runtime/node /harness/artifact-acceptance.mjs /app "$case_name"

if [[ "$case_name" == complete ]]; then
  python3 -B "$script_dir/runtime-artifact.py" verify "$artifact"
fi
