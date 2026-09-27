#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH
unset NODE_OPTIONS NODE_PATH PYTHONHOME PYTHONPATH
umask 077

release_root="${RELEASE_ROOT:-/srv/retrozetro/releases}"
current_link="${CURRENT_LINK:-/srv/retrozetro/current}"
release_env_dest="${RELEASE_ENV_DEST:-/etc/retrozetro/release.env}"
service_name="${SERVICE_NAME:-retrozetro.service}"
health_url="${HEALTH_URL:-http://127.0.0.1:3006/healthz}"
readiness_url="${READINESS_URL:-http://127.0.0.1:3006/readyz}"
identity_url="${IDENTITY_URL:-http://127.0.0.1:3006/release.json}"
site_origin="${SITE_ORIGIN:-https://retrozetrocomics.com}"
site_resolve_ipv4="${SITE_RESOLVE_IPV4:-retrozetrocomics.com:443:127.0.0.1}"
site_resolve_ipv6="${SITE_RESOLVE_IPV6:-retrozetrocomics.com:443:[::1]}"
github_repository="${GITHUB_REPOSITORY:-anderson-webops/retrozetrocomics.com}"
github_token_file="${GITHUB_POST_DEPLOY_TOKEN_FILE:-/etc/retrozetro/github-post-deploy.token}"
node="${NODE_BIN:-/usr/bin/node}"

if [[ $# -ne 3 ]]; then
	cat >&2 <<'USAGE'
Usage: promote-release.sh <protected-archive> <sha256> <commit>

When a current artifact release exists, also pass independently retained evidence:
  ROLLBACK_ARCHIVE=/protected/previous.tar.gz
  ROLLBACK_SHA256=<64 lowercase hex characters>
  ROLLBACK_COMMIT=<40 lowercase hex characters>

A pre-artifact release must first be sealed by the reviewed host transition
procedure. This promoter never trusts or mutates a legacy checkout in place.
USAGE
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run promotion with root privileges." >&2
	exit 1
fi

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
promoter="$script_dir/promote-release.sh"
artifact_verifier="$script_dir/runtime-artifact.py"
artifact_contract="$script_dir/runtime-artifact.json"
archive="$1"
archive_sha="$2"
commit="$3"

if [[ ! "$archive_sha" =~ ^[0-9a-f]{64}$ || ! "$commit" =~ ^[0-9a-f]{40}$ ]]; then
	echo "Pass the independently reviewed archive digest and exact source commit." >&2
	exit 1
fi
if [[ ! -x "$node" || "$("$node" --version)" != v24.18.1 ]]; then
	echo "NODE_BIN must select the approved Node 24.18.1 runtime." >&2
	exit 1
fi

assert_protected_path() {
	/usr/bin/python3 -I - "$1" "$2" <<'PY'
from pathlib import Path
import stat
import sys

path = Path(sys.argv[1])
kind = sys.argv[2]
metadata = path.lstat()
if path.is_symlink() or metadata.st_uid != 0 or stat.S_IMODE(metadata.st_mode) & 0o022:
    raise SystemExit(f"Unprotected {kind}: {path}")
if kind == "directory" and not path.is_dir():
    raise SystemExit(f"Expected protected directory: {path}")
if kind == "file" and (not path.is_file() or metadata.st_nlink != 1):
    raise SystemExit(f"Expected one protected regular file: {path}")
for parent in path.parents:
    metadata = parent.lstat()
    if (
        parent.is_symlink()
        or metadata.st_uid != 0
        or stat.S_IMODE(metadata.st_mode) & 0o022
    ):
        raise SystemExit(f"Unprotected parent directory: {parent}")
PY
}

for control in "$promoter" "$artifact_verifier" "$artifact_contract"; do
	assert_protected_path "$control" file
done
archive="$(realpath -e -- "$archive")"
assert_protected_path "$archive" file

install -o root -g root -d -m 0755 "$release_root" "$(dirname -- "$current_link")"
release_root_real="$(cd -- "$release_root" && pwd -P)"
assert_protected_path "$release_root_real" directory
assert_protected_path "$(dirname -- "$current_link")" directory

if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi
if ! nginx -t; then
	echo "Nginx configuration must pass before promotion." >&2
	exit 1
fi

recovery_root="$(dirname -- "$current_link")/.deployment-recovery"
install -o root -g root -d -m 0700 "$recovery_root"
assert_protected_path "$recovery_root" directory
exec 9>"$recovery_root/promotion.lock"
if ! flock -n 9; then
	echo "Another RetroZetro promotion is active." >&2
	exit 1
fi

previous_target=""
rollback_archive="${ROLLBACK_ARCHIVE:-}"
rollback_sha="${ROLLBACK_SHA256:-}"
rollback_commit="${ROLLBACK_COMMIT:-}"
export RETROZETRO_RUNTIME_CONTRACT="$artifact_contract"

if [[ -L "$current_link" ]]; then
	previous_target="$(readlink -f -- "$current_link" 2>/dev/null || true)"
	if [[ -z "$previous_target" ]]; then
		echo "Existing deployment symlink does not resolve." >&2
		exit 1
	fi
	case "$previous_target/" in
		"$release_root_real/"*) ;;
		*) echo "Existing deployment target is outside $release_root_real." >&2; exit 1 ;;
	esac
	if [[ ! -f "$previous_target/runtime-manifest.json" ]]; then
		echo "The current release predates immutable artifacts; seal it with the reviewed host transition before promotion." >&2
		exit 1
	fi
	if [[ -z "$rollback_archive" || ! "$rollback_sha" =~ ^[0-9a-f]{64}$ || ! "$rollback_commit" =~ ^[0-9a-f]{40}$ ]]; then
		echo "A current release requires ROLLBACK_ARCHIVE, ROLLBACK_SHA256, and ROLLBACK_COMMIT." >&2
		exit 1
	fi
	rollback_archive="$(realpath -e -- "$rollback_archive")"
	assert_protected_path "$rollback_archive" file
	/usr/bin/python3 -I "$artifact_verifier" verify "$previous_target" \
		--archive "$rollback_archive" --sha256 "$rollback_sha" \
		--commit "$rollback_commit"
	if [[ ! -f "$release_env_dest" ]]; then
		echo "The current release has no rollback identity environment." >&2
		exit 1
	fi
	assert_protected_path "$release_env_dest" file
elif systemctl is-active --quiet "$service_name"; then
	echo "An active service without a verified current release needs operator review." >&2
	exit 1
fi

candidate_stage="$(mktemp -d "$release_root_real/.candidate-${commit:0:12}-XXXXXXXX")"
candidate=""
next_link="${current_link}.next.$$"
release_env_next="${release_env_dest}.next.$$"
release_env_temp="$(mktemp)"
release_env_backup="$(mktemp)"
response_probe="$(mktemp)"
response_identity="$(mktemp)"
response_misc="$(mktemp)"
headers="$(mktemp)"
github_curl_config="$(mktemp)"
recovery_record="$(mktemp "$recovery_root/promotion-XXXXXXXX")"
promotion_started_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
had_release_env=false
mutation_started=false
finished=false
rollback_failed=false
if [[ -f "$release_env_dest" ]]; then
	cp -p -- "$release_env_dest" "$release_env_backup"
	had_release_env=true
fi

write_recovery_record() {
	local state="$1"
	/usr/bin/python3 -I - \
		"$recovery_record" "$state" "$promotion_started_at" \
		"$candidate" "$archive" "$archive_sha" "$commit" \
		"$previous_target" "$rollback_archive" "$rollback_sha" "$rollback_commit" <<'PY'
import datetime
import json
from pathlib import Path
import sys

(record, state, started_at, candidate_target, candidate_archive,
 candidate_sha, candidate_commit, rollback_target, rollback_archive,
 rollback_sha, rollback_commit) = sys.argv[1:]
payload = {
    "candidate": {
        "archive": candidate_archive,
        "archiveSha256": candidate_sha,
        "commit": candidate_commit,
        "target": candidate_target,
    },
    "format": 1,
    "rollback": {
        "archive": rollback_archive,
        "archiveSha256": rollback_sha,
        "commit": rollback_commit,
        "target": rollback_target,
    },
    "startedAt": started_at,
    "state": state,
    "updatedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
}
target = Path(record)
target.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n")
target.chmod(0o600)
PY
}

activate_target() {
	local target="$1"
	if [[ -L "$next_link" ]]; then unlink -- "$next_link"; fi
	ln -s -- "$target" "$next_link"
	mv -Tf -- "$next_link" "$current_link"
}

install_release_environment() {
	local source="$1"
	install -D -o root -g retrozetro -m 0640 "$source" "$release_env_next"
	mv -Tf -- "$release_env_next" "$release_env_dest"
}

write_candidate_environment() {
	local marker="$1"
	"$node" -e '
const fs = require("node:fs")
const marker = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
if (!/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(marker.release)) process.exit(1)
if (!/^[0-9a-f]{40}$/.test(marker.commitSha)) process.exit(1)
process.stdout.write(`RETROZETRO_RELEASE_VERSION=${marker.release}\nSOURCE_REVISION=${marker.commitSha}\nDEPLOYED_AT=${new Date().toISOString()}\n`)
' "$marker" > "$release_env_temp"
	install_release_environment "$release_env_temp"
}

probe_is_minimal() {
	"$node" -e '
const fs = require("node:fs")
const body = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
if (JSON.stringify(body) !== JSON.stringify({ ok: true })) process.exit(1)
' "$1"
}

identity_matches() {
	"$node" -e '
const fs = require("node:fs")
const marker = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
const actual = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
if (`v${actual.version}` !== marker.release || actual.revision !== marker.commitSha) process.exit(1)
' "$1" "$2"
}

head_is_safe() {
	local url="$1"
	: > "$headers"
	curl --noproxy '*' --fail --silent --show-error --max-time 5 --head \
		--dump-header "$headers" --output /dev/null "$url" \
		&& grep -Eiq '^cache-control:[[:space:]]*no-store' "$headers" \
		&& ! grep -Eiq '^(set-cookie|location|www-authenticate):' "$headers"
}

headers_are_strict() {
	grep -Eiq "^Content-Security-Policy:.*frame-ancestors[[:space:]]+'none'" "$headers" \
		&& grep -Eiq "^Content-Security-Policy:.*script-src[^;]*'self'" "$headers" \
		&& ! grep -Eiq '^Content-Security-Policy:.*script-src[^;]*unsafe-(inline|eval)' "$headers" \
		&& grep -Eiq '^Strict-Transport-Security:.*max-age=63072000.*includeSubDomains.*preload' "$headers" \
		&& grep -Eiq '^X-Content-Type-Options:[[:space:]]*nosniff' "$headers" \
		&& ! grep -Eiq '^X-Powered-By:' "$headers"
}

verify_local_target() {
	local target="$1"
	local marker="$target/.retrozetro-release-prepared.json"
	curl --noproxy '*' --fail --silent --show-error --max-time 5 \
		"$health_url" --output "$response_probe" \
		&& probe_is_minimal "$response_probe" \
		&& curl --noproxy '*' --fail --silent --show-error --max-time 5 \
			"$readiness_url" --output "$response_probe" \
		&& probe_is_minimal "$response_probe" \
		&& head_is_safe "$health_url" \
		&& head_is_safe "$readiness_url" \
		&& curl --noproxy '*' --fail --silent --show-error --max-time 5 \
			"$identity_url" --output "$response_identity" \
		&& identity_matches "$marker" "$response_identity"
}

verify_public_target() {
	local target="$1"
	local marker="$target/.retrozetro-release-prepared.json"
	curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
		--resolve "$site_resolve_ipv4" "$site_origin/release.json" --output "$response_identity" \
		&& identity_matches "$marker" "$response_identity" \
		|| return 1
	curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 \
		--resolve "$site_resolve_ipv4" --dump-header "$headers" "$site_origin/" --output /dev/null \
		&& headers_are_strict \
		|| return 1
	curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
		--resolve "$site_resolve_ipv6" "$site_origin/release.json" --output "$response_identity" \
		&& identity_matches "$marker" "$response_identity" \
		|| return 1
	curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 \
		--resolve "$site_resolve_ipv6" --dump-header "$headers" "$site_origin/" --output /dev/null \
		&& headers_are_strict \
		|| return 1
	curl --noproxy '*' --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
		"$site_origin/healthz" --output "$response_probe" \
		&& probe_is_minimal "$response_probe" \
		&& [[ "$(curl --noproxy '*' --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--request POST --header 'Content-Type: application/json' --header 'Origin: https://deployment-audit.invalid' \
			--header 'Sec-Fetch-Site: cross-site' --data '{}' --output "$response_misc" --write-out '%{http_code}' \
			"$site_origin/api/contact")" == "403" ]] \
		&& [[ "$(curl --noproxy '*' --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--output "$response_misc" --write-out '%{http_code}' "$site_origin/api/admin/dashboard")" == "401" ]] \
		&& [[ "$(curl --noproxy '*' --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--output "$response_misc" --write-out '%{http_code}' "$site_origin/api/internal/dbinfo")" == "403" ]]
}

wait_for_target() {
	local target="$1"
	local attempts_remaining=40
	while (( attempts_remaining > 0 )); do
		if verify_local_target "$target" && verify_public_target "$target"; then
			return 0
		fi
		attempts_remaining=$((attempts_remaining - 1))
		sleep 1
	done
	return 1
}

dispatch_post_deploy_verification() {
	local marker="$1"
	local token token_mode status
	if [[ ! -f "$github_token_file" || -L "$github_token_file" ]]; then
		echo "Post-deploy GitHub token file is missing or unsafe: $github_token_file" >&2
		return 1
	fi
	if [[ "$(stat -c '%u' -- "$github_token_file")" != "0" ]]; then
		echo "Post-deploy GitHub token file must be owned by root." >&2
		return 1
	fi
	token_mode="$(stat -c '%a' -- "$github_token_file")"
	if [[ "$token_mode" != "400" && "$token_mode" != "600" ]]; then
		echo "Post-deploy GitHub token file mode must be 0400 or 0600." >&2
		return 1
	fi
	token="$(<"$github_token_file")"
	if [[ ! "$token" =~ ^[A-Za-z0-9_]{20,512}$ ]]; then
		echo "Post-deploy GitHub token file does not contain a bounded token." >&2
		return 1
	fi
	printf 'header = "Authorization: Bearer %s"\n' "$token" > "$github_curl_config"
	printf 'header = "Accept: application/vnd.github+json"\n' >> "$github_curl_config"
	printf 'header = "X-GitHub-Api-Version: 2022-11-28"\n' >> "$github_curl_config"
	chmod 600 "$github_curl_config"
	"$node" -e '
const fs = require("node:fs")
const marker = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
process.stdout.write(JSON.stringify({ ref: "main", inputs: {
  expected_revision: marker.commitSha,
  expected_version: marker.release
}}))
' "$marker" > "$response_misc"
	status="$(curl --config "$github_curl_config" --silent --show-error --max-time 15 \
		--request POST --header 'Content-Type: application/json' --data-binary "@$response_misc" \
		--output /dev/null --write-out '%{http_code}' \
		"https://api.github.com/repos/$github_repository/actions/workflows/post-deploy.yml/dispatches")"
	[[ "$status" == "204" ]]
}

verify_rollback() {
	/usr/bin/python3 -I "$artifact_verifier" verify "$previous_target" \
		--archive "$rollback_archive" --sha256 "$rollback_sha" \
		--commit "$rollback_commit"
}

rollback() {
	local failed=0
	if [[ -n "$previous_target" ]]; then
		verify_rollback || failed=1
		if [[ "$failed" -eq 0 ]]; then
			activate_target "$previous_target" || failed=1
			if [[ "$had_release_env" == true ]]; then
				install_release_environment "$release_env_backup" || failed=1
			fi
			systemctl restart "$service_name" || failed=1
			wait_for_target "$previous_target" || failed=1
		fi
	else
		if [[ -L "$current_link" ]]; then unlink -- "$current_link" || failed=1; fi
		if [[ "$had_release_env" == true ]]; then
			install_release_environment "$release_env_backup" || failed=1
		elif [[ -e "$release_env_dest" || -L "$release_env_dest" ]]; then
			unlink -- "$release_env_dest" || failed=1
		fi
		systemctl stop "$service_name" || failed=1
	fi
	return "$failed"
}

cleanup() {
	if [[ -L "$next_link" ]]; then unlink -- "$next_link"; fi
	if [[ -e "$release_env_next" || -L "$release_env_next" ]]; then unlink -- "$release_env_next"; fi
	rm -f -- "$release_env_temp" "$release_env_backup" "$response_probe" \
		"$response_identity" "$response_misc" "$headers" "$github_curl_config"
	if [[ -n "$candidate_stage" && -d "$candidate_stage" ]]; then
		case "$candidate_stage" in
			"$release_root_real"/.candidate-*) rm -rf -- "$candidate_stage" ;;
			*) echo "Refusing to remove unexpected candidate path: $candidate_stage" >&2 ;;
		esac
	fi
}

on_exit() {
	local status=$?
	trap - EXIT
	trap '' HUP INT TERM
	if [[ "$mutation_started" == true && "$finished" != true ]]; then
		if ! rollback; then
			rollback_failed=true
			write_recovery_record "rollback_failed" \
				|| echo "CRITICAL: failed to update the protected recovery record." >&2
			echo "CRITICAL: rollback needs operator recovery; protected record retained at $recovery_record" >&2
		fi
		if [[ "$status" == 0 ]]; then status=1; fi
	fi
	cleanup
	if [[ "$rollback_failed" != true ]]; then rm -f -- "$recovery_record"; fi
	exit "$status"
}
trap on_exit EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

/usr/bin/python3 -I "$artifact_verifier" unpack "$candidate_stage" \
	--archive "$archive" --sha256 "$archive_sha" --commit "$commit"
release="$("$node" -p 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8")).release' "$candidate_stage/.retrozetro-release-prepared.json")"
if [[ ! "$release" =~ ^v[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$ ]]; then
	echo "Candidate has an invalid release identity." >&2
	exit 1
fi
candidate="$release_root_real/${release#v}-${commit:0:12}"
if [[ -e "$candidate" || -L "$candidate" ]]; then
	echo "Refusing to overwrite existing immutable release: $candidate" >&2
	exit 1
fi
chown -R root:root "$candidate_stage"
find "$candidate_stage" -type d -exec chmod 0755 {} +
find "$candidate_stage" -type f -exec chmod 0644 {} +
/usr/bin/python3 -I "$artifact_verifier" verify "$candidate_stage" \
	--archive "$archive" --sha256 "$archive_sha" --commit "$commit"
mv -T -- "$candidate_stage" "$candidate"
candidate_stage=""
assert_protected_path "$candidate" directory
/usr/bin/python3 -I "$artifact_verifier" verify "$candidate" \
	--archive "$archive" --sha256 "$archive_sha" --commit "$commit"

if [[ "$candidate" == "$previous_target" ]]; then
	echo "Candidate and rollback target must be distinct." >&2
	exit 1
fi
write_recovery_record "promotion_started"
mutation_started=true
write_candidate_environment "$candidate/.retrozetro-release-prepared.json"
activate_target "$candidate"
if systemctl restart "$service_name" \
	&& wait_for_target "$candidate" \
	&& dispatch_post_deploy_verification "$candidate/.retrozetro-release-prepared.json"; then
	finished=true
	rm -f -- "$recovery_record"
	echo "Promoted $candidate and verified exact identity, health, readiness, and edge boundaries."
	exit 0
fi

echo "Candidate acceptance failed; restoring the independently verified previous release." >&2
exit 1
