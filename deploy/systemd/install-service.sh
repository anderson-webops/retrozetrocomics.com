#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
unit_dest="${UNIT_DEST:-/etc/systemd/system/retrozetro.service}"
secret_env_dest="${SECRET_ENV_DEST:-/etc/retrozetro/retrozetro.env}"
release_env_dest="${RELEASE_ENV_DEST:-/etc/retrozetro/release.env}"
release_root="${RELEASE_ROOT:-/srv/retrozetro/releases}"
shared_upload_root="${SHARED_UPLOAD_ROOT:-/srv/retrozetro/shared/uploads}"
dry_run=false
force_env=false

usage() {
	cat <<'USAGE'
Install the direct RetroZetro systemd baseline without starting it.

Usage: install-service.sh [--dry-run] [--force-env]

  --dry-run    Print the intended commands without changing the host.
  --force-env  Replace the secret environment with the fail-closed example.
USAGE
}

while [[ $# -gt 0 ]]; do
	case "$1" in
		--dry-run) dry_run=true ;;
		--force-env) force_env=true ;;
		-h|--help) usage; exit 0 ;;
		*) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
	esac
	shift
done

run() {
	if [[ "$dry_run" == true ]]; then
		printf ' %q' "$@"
		printf '\n'
		return 0
	fi
	"$@"
}

if [[ "$dry_run" == false ]]; then
	if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
		echo "Run installation with root privileges." >&2
		exit 1
	fi
	if [[ ! -x /usr/bin/node || "$(/usr/bin/node --version)" != "v24.18.1" ]]; then
		echo "The systemd runtime requires Node 24.18.1 at /usr/bin/node." >&2
		exit 1
	fi
	if [[ ! -x /usr/bin/npm || "$(/usr/bin/npm --version)" != "12.0.2" ]]; then
		echo "Release preparation requires npm 12.0.2 at /usr/bin/npm." >&2
		exit 1
	fi
	if ! id retrozetro >/dev/null 2>&1; then
		echo "Create the unprivileged retrozetro system account before installing the unit." >&2
		exit 1
	fi
fi

run install -d -o retrozetro -g retrozetro -m 0750 "$release_root"
run install -d -o retrozetro -g retrozetro -m 0700 "$shared_upload_root"
run install -D -o root -g root -m 0644 "$script_dir/retrozetro.service" "$unit_dest"

if [[ "$force_env" == true || ! -e "$secret_env_dest" ]]; then
	run install -D -o root -g retrozetro -m 0640 "$script_dir/retrozetro.env.example" "$secret_env_dest"
else
	echo "Keeping existing $secret_env_dest. Use --force-env only for an intentional replacement."
fi

if [[ ! -e "$release_env_dest" ]]; then
	run install -D -o root -g retrozetro -m 0640 "$script_dir/release.env.example" "$release_env_dest"
fi

run systemctl daemon-reload
echo "Review the secret environment and Nginx include, then prepare and promote a release."
