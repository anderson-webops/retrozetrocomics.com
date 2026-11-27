#!/usr/bin/env bash
set -euo pipefail

case "${RUNNER_OS:-}:${RUNNER_ARCH:-}:${NODE_VERSION:-}" in
  Linux:X64:26.13.1)
    platform=linux-x64
    checksum=5c063e46bab0fbc1c17cc445d7ff129cbdcd0471be6ed83b6ab864f8143bc864
    ;;
  Linux:ARM64:26.13.1)
    platform=linux-arm64
    checksum=89e1853138db51e8b82d3e98ba9c0d3f2956a28e5e55ea1b7e12d25aae92d5dd
    ;;
  *)
    printf 'No reviewed Node archive digest for %s/%s at %s.\n' "${RUNNER_OS:-}" "${RUNNER_ARCH:-}" "${NODE_VERSION:-}" >&2
    exit 1
    ;;
esac

: "${RUNNER_TEMP:?}" "${GITHUB_PATH:?}"
umask 077
scratch=$(mktemp -d "$RUNNER_TEMP/retrozetro-node.XXXXXXXX")
prefix="node-v$NODE_VERSION-$platform"
archive="$scratch/$prefix.tar.xz"
curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' \
  --connect-timeout 10 --max-time 120 --retry 2 \
  --output "$archive" "https://nodejs.org/dist/v$NODE_VERSION/$prefix.tar.xz"
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check --strict
tar --extract --xz --file "$archive" --directory "$scratch" --no-same-owner --no-same-permissions
binary="$scratch/$prefix/bin/node"
test -f "$binary" && test ! -L "$binary" && test -O "$binary" || exit 1
writable=$(find "$binary" -perm /022 -print)
test -z "$writable"
test "$("$binary" --version)" = "v$NODE_VERSION"
rm -- "$archive"
printf '%s\n' "$scratch/$prefix/bin" >> "$GITHUB_PATH"
