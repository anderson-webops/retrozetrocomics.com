#!/usr/bin/env bash
set -euo pipefail

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

release_root="${RELEASE_ROOT:-/srv/retrozetro/releases}"
current_link="${CURRENT_LINK:-/srv/retrozetro/current}"
release_env_dest="${RELEASE_ENV_DEST:-/etc/retrozetro/release.env}"
service_name="${SERVICE_NAME:-retrozetro.service}"
health_url="${HEALTH_URL:-http://127.0.0.1:3006/api/healthz}"
ready_url="${READY_URL:-http://127.0.0.1:3006/api/readyz}"
local_site_origin="${LOCAL_SITE_ORIGIN:-http://127.0.0.1:3006}"
site_origin="${SITE_ORIGIN:-https://retrozetrocomics.com}"
site_resolve_ipv4="${SITE_RESOLVE_IPV4:-retrozetrocomics.com:443:127.0.0.1}"
site_resolve_ipv6="${SITE_RESOLVE_IPV6:-retrozetrocomics.com:443:[::1]}"
github_repository="${GITHUB_REPOSITORY:-anderson-webops/retrozetrocomics.com}"
github_token_file="${GITHUB_POST_DEPLOY_TOKEN_FILE:-/etc/retrozetro/github-post-deploy.token}"

if [[ $# -ne 1 ]]; then
	echo "Usage: promote-release.sh /srv/retrozetro/releases/<prepared-release>" >&2
	exit 2
fi
if [[ ${EUID:-$(id -u)} -ne 0 ]]; then
	echo "Run promotion with root privileges." >&2
	exit 1
fi

release_root_real="$(cd -- "$release_root" && pwd -P)"
candidate="$(cd -- "$1" && pwd -P)"
case "$candidate/" in
	"$release_root_real/"*) ;;
	*) echo "Candidate must resolve beneath $release_root_real: $candidate" >&2; exit 1 ;;
esac
if [[ "$candidate" == "$release_root_real" ]]; then
	echo "Candidate must be a prepared release beneath, not equal to, $release_root_real." >&2
	exit 1
fi
for required_file in \
	back-end/dist/server.js \
	front-end/dist/index.html \
	front-end/dist/release.json \
	.retrozetro-release-prepared.json; do
	if [[ ! -f "$candidate/$required_file" ]]; then
		echo "Prepared release is missing $required_file." >&2
		exit 1
	fi
done

prepared_commit="$(/usr/bin/node -e 'process.stdout.write(require(process.argv[1]).commitSha)' "$candidate/.retrozetro-release-prepared.json")"
if [[ "$(git -C "$candidate" rev-parse HEAD)" != "$prepared_commit" ]]; then
	echo "Prepared release metadata does not match the candidate Git revision." >&2
	exit 1
fi
if [[ -e "$current_link" && ! -L "$current_link" ]]; then
	echo "Refusing to replace non-symlink deployment path: $current_link" >&2
	exit 1
fi

previous_target="$(readlink -f -- "$current_link" 2>/dev/null || true)"
if [[ -n "$previous_target" ]]; then
	case "$previous_target/" in
		"$release_root_real/"*) ;;
		*) echo "Existing deployment target is outside $release_root_real: $previous_target" >&2; exit 1 ;;
	esac
fi

next_link="${current_link}.next.$$"
release_env_next="${release_env_dest}.next.$$"
response_local="$(mktemp)"
response_ipv4="$(mktemp)"
response_ipv6="$(mktemp)"
response_misc="$(mktemp)"
headers_ipv4="$(mktemp)"
headers_ipv6="$(mktemp)"
release_env_temp="$(mktemp)"
release_env_backup="$(mktemp)"
github_curl_config="$(mktemp)"
candidate_identity="$(mktemp)"
previous_identity="$(mktemp)"
had_release_env=false
if [[ -f "$release_env_dest" ]]; then
	cp -p -- "$release_env_dest" "$release_env_backup"
	had_release_env=true
fi
cleanup() {
	if [[ -L "$next_link" ]]; then unlink -- "$next_link"; fi
	if [[ -e "$release_env_next" || -L "$release_env_next" ]]; then unlink -- "$release_env_next"; fi
	rm -f -- "$response_local" "$response_ipv4" "$response_ipv6" "$response_misc" \
		"$headers_ipv4" "$headers_ipv6" "$release_env_temp" "$release_env_backup" \
		"$candidate_identity" "$previous_identity" "$github_curl_config"
}
trap cleanup EXIT

if [[ -n "$previous_target" && "$had_release_env" == false ]]; then
	echo "Refusing promotion because the current release has no rollback identity environment." >&2
	exit 1
fi

activate_target() {
	local target="$1"
	ln -s -- "$target" "$next_link"
	mv -Tf -- "$next_link" "$current_link"
}

install_release_environment() {
	local source="$1"
	install -D -o root -g retrozetro -m 0640 "$source" "$release_env_next"
	mv -Tf -- "$release_env_next" "$release_env_dest"
}

write_release_environment() {
	local identity="$1"
	/usr/bin/node -e '
const release = require(process.argv[1]);
if (!/^v\d+\.\d+\.\d+$/.test(release.release)) process.exit(1);
if (!/^[0-9a-f]{40}$/.test(release.commitSha)) process.exit(1);
if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(release.deployedAt)) process.exit(1);
process.stdout.write(`RETROZETRO_RELEASE_VERSION=${release.release}\nSOURCE_REVISION=${release.commitSha}\nDEPLOYED_AT=${release.deployedAt}\n`);
' "$identity" > "$release_env_temp"
	install_release_environment "$release_env_temp"
}

static_identity_matches() {
	local target="$1"
	local actual="$2"
	/usr/bin/node -e '
const expected = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
const actual = JSON.parse(require("node:fs").readFileSync(process.argv[2], "utf8"));
if (actual.version !== expected.version || actual.revision !== expected.revision) process.exit(1);
' "$target/front-end/dist/release.json" "$actual"
}

probe_is_minimal_and_healthy() {
	local actual="$1"
	/usr/bin/node -e '
const value = JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"));
if (
	!value
	|| typeof value !== "object"
	|| Array.isArray(value)
	|| Object.keys(value).length !== 1
	|| value.ok !== true
) process.exit(1);
' "$actual"
}

headers_are_strict() {
	local headers="$1"
	grep -Eiq '^Content-Security-Policy:.*frame-ancestors .none.' "$headers" \
		&& grep -Eiq '^Content-Security-Policy:.*script-src[^;]*.self.' "$headers" \
		&& ! grep -Eiq '^Content-Security-Policy:.*script-src[^;]*unsafe-(inline|eval)' "$headers" \
		&& grep -Eiq '^Strict-Transport-Security:.*max-age=63072000.*includeSubDomains.*preload' "$headers" \
		&& grep -Eiq '^X-Content-Type-Options:[[:space:]]*nosniff' "$headers" \
		&& ! grep -Eiq '^X-Powered-By:' "$headers"
}

verify_target() {
	local target="$1"
	curl --noproxy '*' --fail --silent --show-error --max-time 5 "$health_url" --output "$response_local" \
		&& probe_is_minimal_and_healthy "$response_local" \
		&& curl --noproxy '*' --fail --silent --show-error --max-time 5 "$ready_url" --output "$response_local" \
		&& probe_is_minimal_and_healthy "$response_local" \
		&& curl --noproxy '*' --fail --silent --show-error --max-time 5 \
			"$local_site_origin/release.json" --output "$response_local" \
		&& static_identity_matches "$target" "$response_local" \
		&& curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			"$site_origin/release.json" --output "$response_ipv4" \
		&& static_identity_matches "$target" "$response_ipv4" \
		&& curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv6" \
			"$site_origin/release.json" --output "$response_ipv6" \
		&& static_identity_matches "$target" "$response_ipv6" \
		&& curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--dump-header "$headers_ipv4" "$site_origin/" --output /dev/null \
		&& curl --noproxy '*' --ipv6 --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv6" \
			--dump-header "$headers_ipv6" "$site_origin/" --output /dev/null \
		&& headers_are_strict "$headers_ipv4" \
		&& headers_are_strict "$headers_ipv6" \
		&& curl --noproxy '*' --ipv4 --fail --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			"$site_origin/api/healthz" --output "$response_local" \
		&& probe_is_minimal_and_healthy "$response_local" \
		&& [[ "$(curl --noproxy '*' --ipv4 --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--request POST --header 'Content-Type: application/json' --header 'Origin: https://deployment-audit.invalid' \
			--header 'Sec-Fetch-Site: cross-site' --data '{}' --output "$response_misc" --write-out '%{http_code}' \
			"$site_origin/api/contact")" == "403" ]] \
		&& [[ "$(curl --noproxy '*' --ipv4 --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--output "$response_misc" --write-out '%{http_code}' "$site_origin/api/admin/dashboard")" == "401" ]] \
		&& [[ "$(curl --noproxy '*' --ipv4 --silent --show-error --max-time 5 --resolve "$site_resolve_ipv4" \
			--output "$response_misc" --write-out '%{http_code}' "$site_origin/api/internal/dbinfo")" == "404" ]]
}

wait_for_target() {
	local target="$1"
	local attempt
	for attempt in {1..30}; do
		if verify_target "$target"; then
			return 0
		fi
		sleep 1
	done
	return 1
}

dispatch_post_deploy_verification() {
	local identity="$1"
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
	/usr/bin/node -e '
const identity = require(process.argv[1]);
process.stdout.write(JSON.stringify({
	ref: "main",
	inputs: {
		expected_revision: identity.commitSha,
		expected_version: identity.release
	}
}));
' "$identity" > "$response_misc"
	status="$(curl --config "$github_curl_config" --silent --show-error --max-time 15 \
		--request POST --header 'Content-Type: application/json' --data-binary "@$response_misc" \
		--output /dev/null --write-out '%{http_code}' \
		"https://api.github.com/repos/$github_repository/actions/workflows/post-deploy.yml/dispatches")"
	[[ "$status" == "204" ]]
}

/usr/bin/node -e '
const marker = require(process.argv[1]);
if (!/^v\d+\.\d+\.\d+$/.test(marker.release)) process.exit(1);
if (!/^[0-9a-f]{40}$/.test(marker.commitSha)) process.exit(1);
process.stdout.write(`${JSON.stringify({
	release: marker.release,
	commitSha: marker.commitSha,
	deployedAt: new Date().toISOString()
}, null, 2)}\n`);
' "$candidate/.retrozetro-release-prepared.json" > "$candidate_identity"

if [[ -n "$previous_target" && "$had_release_env" == true ]]; then
	/usr/bin/node -e '
const values = Object.fromEntries(require("node:fs").readFileSync(process.argv[1], "utf8")
	.split(/\r?\n/).filter(Boolean).map((line) => {
		const separator = line.indexOf("=");
		return [line.slice(0, separator), line.slice(separator + 1)];
	}));
process.stdout.write(`${JSON.stringify({
	release: values.RETROZETRO_RELEASE_VERSION,
	commitSha: values.SOURCE_REVISION,
	deployedAt: values.DEPLOYED_AT
}, null, 2)}\n`);
' "$release_env_backup" > "$previous_identity"
fi

nginx -t
write_release_environment "$candidate_identity"
activate_target "$candidate"
if systemctl restart "$service_name" \
	&& systemctl reload nginx \
	&& wait_for_target "$candidate" \
	&& dispatch_post_deploy_verification "$candidate_identity"; then
	echo "Promoted $candidate, verified the local and IPv4/IPv6 boundaries, and dispatched independent post-deploy verification."
	exit 0
fi

echo "Candidate verification failed; restoring the previous release." >&2
if [[ -n "$previous_target" ]]; then
	activate_target "$previous_target"
else
	unlink -- "$current_link"
fi
if [[ "$had_release_env" == true ]]; then
	install_release_environment "$release_env_backup"
else
	if [[ -e "$release_env_dest" || -L "$release_env_dest" ]]; then unlink -- "$release_env_dest"; fi
fi
if [[ -n "$previous_target" ]]; then
	systemctl restart "$service_name"
	nginx -t && systemctl reload nginx
	if [[ ! -s "$previous_identity" ]]; then
		echo "The previous release was restored without identity metadata for automated verification." >&2
	elif ! wait_for_target "$previous_target"; then
		echo "The previous release was restored but did not pass the same verification gates." >&2
	fi
else
	systemctl stop "$service_name"
	nginx -t && systemctl reload nginx
fi
exit 1
