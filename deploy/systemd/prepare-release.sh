#!/usr/bin/env bash
set -euo pipefail

root=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd -P)
if [[ $# -ne 1 ]]; then
	echo "Usage: prepare-release.sh <empty-repository-.ai-work/runs-directory>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -eq 0 ]]; then
	echo "Build artifacts as a secret-inaccessible release builder, not root." >&2
	exit 1
fi

exec "$root/scripts/package-runtime.sh" "$1"
