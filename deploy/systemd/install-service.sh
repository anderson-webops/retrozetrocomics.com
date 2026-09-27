#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
umask 077

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
repo_root="$(cd -- "$script_dir/../.." && pwd -P)"
unit_dest="${UNIT_DEST:-/etc/systemd/system/retrozetro.service}"
secret_env_dest="${SECRET_ENV_DEST:-/etc/retrozetro/retrozetro.env}"
release_env_dest="${RELEASE_ENV_DEST:-/etc/retrozetro/release.env}"
release_root="${RELEASE_ROOT:-/srv/retrozetro/releases}"
incoming_root="${INCOMING_ROOT:-/srv/retrozetro/incoming}"
shared_upload_root="${SHARED_UPLOAD_ROOT:-/srv/retrozetro/shared/uploads}"
builder_root="${BUILDER_ROOT:-/var/lib/retrozetro-builder/source}"
helper_dest="${HELPER_DEST:-/usr/local/libexec/retrozetro}"
lock_file="${LOCK_FILE:-/run/lock/retrozetro-control-install.lock}"
systemctl_bin="${SYSTEMCTL_BIN:-systemctl}"
dry_run=false
force_env=false
expected_control_digest="${EXPECTED_CONTROL_SHA256:-}"

usage() {
	cat <<'USAGE'
Install reviewed RetroZetro host controls without starting the service.

Usage: install-service.sh [--dry-run] [--force-env]

  --dry-run    Verify inputs and print planned permanent mutations.
  --force-env  Replace the protected environments with fail-closed examples.

The mutating invocation requires EXPECTED_CONTROL_SHA256, copied from a
separately reviewed --dry-run. This binds root installation to the exact
reviewed source control bytes.
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

if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run the host-control installer with root privileges." >&2
	exit 1
fi
if [[ ! -x /usr/bin/node || "$(/usr/bin/node --version)" != v24.18.1 ]]; then
	echo "The canonical direct service requires Node 24.18.1 at /usr/bin/node." >&2
	exit 1
fi
for account in retrozetro retrozetro-builder; do
	if ! id "$account" >/dev/null 2>&1; then
		echo "Create the locked $account system account before installation." >&2
		exit 1
	fi
done
for runtime_group in retrozetro tyler site_retrozetro; do
	if getent group "$runtime_group" >/dev/null 2>&1 \
		&& id -nG retrozetro-builder | tr ' ' '\n' | grep -Fxq "$runtime_group"; then
		echo "retrozetro-builder must not belong to runtime group $runtime_group." >&2
		exit 1
	fi
done

validate_existing_environment() {
	local target="$1"
	local label="$2"
	if [[ -L "$target" ]]; then
		echo "Existing $label must not be a symbolic link: $target" >&2
		exit 1
	fi
	if [[ ! -e "$target" ]]; then
		return
	fi
	if [[ ! -f "$target" ]]; then
		echo "Existing $label must be a regular file: $target" >&2
		exit 1
	fi
	if [[ "$force_env" == false ]]; then
		local mode
		mode="$(stat -c '%a' "$target")"
		if [[ "$(stat -c '%U:%G' "$target")" != "root:retrozetro" \
			|| ( "$mode" != "640" && "$mode" != "600" ) ]]; then
			echo "Existing $label must be root:retrozetro with mode 0640 or 0600." >&2
			exit 1
		fi
	fi
}

validate_existing_environment "$secret_env_dest" "secret environment"
validate_existing_environment "$release_env_dest" "release environment"
if [[ -L "$unit_dest" || ( -e "$unit_dest" && ! -f "$unit_dest" ) ]]; then
	echo "Existing service-unit target must be a regular file: $unit_dest" >&2
	exit 1
fi
if [[ -f "$unit_dest" && ( "$(stat -c '%U' "$unit_dest")" != root \
	|| $(( 8#$(stat -c '%a' "$unit_dest") & 8#022 )) -ne 0 ) ]]; then
	echo "Existing service-unit target must be root-owned and not group/world writable." >&2
	exit 1
fi

declare -a controls=(
	"deploy/systemd/install-service.sh"
	"deploy/systemd/promote-release.sh"
	"deploy/systemd/retrozetro.service"
	"deploy/systemd/retrozetro.env.example"
	"deploy/systemd/release.env.example"
	"deploy/runtime-artifact.json"
	"scripts/runtime-artifact.py"
)
declare -a installed_names=(
	"install-service.sh"
	"promote-release.sh"
	"retrozetro.service"
	"retrozetro.env.example"
	"release.env.example"
	"runtime-artifact.json"
	"runtime-artifact.py"
)
for relative in "${controls[@]}"; do
	source_path="$repo_root/$relative"
	if [[ ! -f "$source_path" || -L "$source_path" ]]; then
		echo "Missing or unsafe host-control source: $relative" >&2
		exit 1
	fi
done

control_digest_for() {
	local source_root="$1"
	local use_installed_names="$2"
	local index relative source_name
	{
		for index in "${!controls[@]}"; do
			relative="${controls[$index]}"
			source_name="$relative"
			if [[ "$use_installed_names" == true ]]; then
				source_name="${installed_names[$index]}"
			fi
			printf '%s  %s\n' \
				"$(sha256sum "$source_root/$source_name" | cut -d ' ' -f 1)" \
				"$relative"
		done
	} | sha256sum | cut -d ' ' -f 1
}

control_digest="$(control_digest_for "$repo_root" false)"
if [[ "$dry_run" == false ]]; then
	if [[ ! "$expected_control_digest" =~ ^[0-9a-f]{64}$ ]]; then
		echo "Set EXPECTED_CONTROL_SHA256 from a separately reviewed --dry-run." >&2
		exit 1
	fi
	if [[ "$expected_control_digest" != "$control_digest" ]]; then
		echo "Host-control source changed after review." >&2
		exit 1
	fi
fi
bundle_dest="$helper_dest/bundles/$control_digest"
current_dest="$helper_dest/current"

run() {
	if [[ "$dry_run" == true ]]; then
		printf ' %q' "$@"
		printf '\n'
		return 0
	fi
	"$@"
}

if [[ "$dry_run" == true ]]; then
	echo "Reviewed host controls: $control_digest"
	run install -o root -g root -d -m 0755 \
		"$helper_dest" "$helper_dest/bundles" "$bundle_dest" \
		"$(dirname -- "$unit_dest")" "$(dirname -- "$secret_env_dest")" \
		"$release_root" "$(dirname -- "$release_root")"
	run install -o root -g root -d -m 0700 "$incoming_root"
	run install -o retrozetro -g retrozetro -d -m 0700 "$shared_upload_root"
	run install -o retrozetro-builder -g retrozetro-builder -d -m 0700 "$builder_root"
	run ln -s "bundles/$control_digest" "$current_dest"
	run install -o root -g root -m 0644 \
		"$repo_root/deploy/systemd/retrozetro.service" "$unit_dest"
	if [[ "$force_env" == true || ! -e "$secret_env_dest" ]]; then
		run install -o root -g retrozetro -m 0640 \
			"$repo_root/deploy/systemd/retrozetro.env.example" "$secret_env_dest"
	else
		echo "Keeping existing $secret_env_dest. Use --force-env only when replacing it intentionally."
	fi
	if [[ "$force_env" == true || ! -e "$release_env_dest" ]]; then
		run install -o root -g retrozetro -m 0640 \
			"$repo_root/deploy/systemd/release.env.example" "$release_env_dest"
	else
		echo "Keeping existing $release_env_dest."
	fi
	run "$systemctl_bin" daemon-reload
	exit 0
fi

install -o root -g root -d -m 0755 \
	"$helper_dest" "$helper_dest/bundles" "$(dirname -- "$unit_dest")" \
	"$(dirname -- "$secret_env_dest")" "$(dirname -- "$release_root")" \
	"$release_root" "$(dirname -- "$lock_file")"
install -o root -g root -d -m 0700 "$incoming_root"
install -o retrozetro -g retrozetro -d -m 0700 "$shared_upload_root"
install -o retrozetro-builder -g retrozetro-builder -d -m 0700 "$builder_root"
exec 8>"$lock_file"
if ! flock -n 8; then
	echo "Another RetroZetro host-control installation is active." >&2
	exit 1
fi

stage="$(mktemp -d "$helper_dest/bundles/.next-$control_digest-XXXXXXXX")"
cleanup() {
	if [[ -n "${stage:-}" && -d "$stage" ]]; then
		case "$stage" in
			"$helper_dest/bundles/".next-*) rm -rf -- "$stage" ;;
			*) echo "Refusing to remove unexpected installer path: $stage" >&2 ;;
		esac
	fi
}
trap cleanup EXIT

install -o root -g root -m 0755 \
	"$repo_root/deploy/systemd/install-service.sh" "$stage/install-service.sh"
install -o root -g root -m 0755 \
	"$repo_root/deploy/systemd/promote-release.sh" "$stage/promote-release.sh"
install -o root -g root -m 0755 \
	"$repo_root/scripts/runtime-artifact.py" "$stage/runtime-artifact.py"
install -o root -g root -m 0644 \
	"$repo_root/deploy/runtime-artifact.json" "$stage/runtime-artifact.json"
install -o root -g root -m 0644 \
	"$repo_root/deploy/systemd/retrozetro.service" "$stage/retrozetro.service"
install -o root -g root -m 0644 \
	"$repo_root/deploy/systemd/retrozetro.env.example" "$stage/retrozetro.env.example"
install -o root -g root -m 0644 \
	"$repo_root/deploy/systemd/release.env.example" "$stage/release.env.example"

if [[ "$(control_digest_for "$stage" true)" != "$control_digest" ]]; then
	echo "Host-control source changed while it was being staged." >&2
	exit 1
fi

if [[ -L "$bundle_dest" ]]; then
	echo "Digest-named host-control bundle must not be a symbolic link." >&2
	exit 1
elif [[ -e "$bundle_dest" ]]; then
	if ! diff -qr "$stage" "$bundle_dest" >/dev/null; then
		echo "Existing digest-named host-control bundle differs." >&2
		exit 1
	fi
else
	mv -T -- "$stage" "$bundle_dest"
	stage=""
fi

if [[ -e "$current_dest" && ! -L "$current_dest" ]]; then
	echo "Refusing to replace non-symlink host-control activation: $current_dest" >&2
	exit 1
fi
current_next="$helper_dest/.current.next.$$"
ln -s "bundles/$control_digest" "$current_next"
mv -Tf -- "$current_next" "$current_dest"

install -o root -g root -m 0644 "$bundle_dest/retrozetro.service" "$unit_dest"
if [[ "$force_env" == true || ! -e "$secret_env_dest" ]]; then
	install -o root -g retrozetro -m 0640 \
		"$bundle_dest/retrozetro.env.example" "$secret_env_dest"
else
	echo "Keeping existing $secret_env_dest. Use --force-env only when replacing it intentionally."
fi
if [[ "$force_env" == true || ! -e "$release_env_dest" ]]; then
	install -o root -g retrozetro -m 0640 \
		"$bundle_dest/release.env.example" "$release_env_dest"
else
	echo "Keeping existing $release_env_dest."
fi

if /usr/sbin/runuser -u retrozetro-builder -- test -r "$secret_env_dest"; then
	echo "The release builder can read the protected production environment." >&2
	exit 1
fi

"$systemctl_bin" daemon-reload
echo "Installed reviewed controls at $current_dest. Promote only a validated immutable artifact."
