#!/usr/bin/env python3
"""Rehearse exact two-artifact promotion in disposable Linux CI namespaces."""

import argparse
import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import select
import shutil
import signal
import socket
import socketserver
import subprocess
import sys
import threading
import time
import urllib.parse
import urllib.error
import urllib.request


RETAINED_TAG = "v2.10.7"
RETAINED_COMMIT = "1b9da73c5b295f1e71964a765956b96a823768da"
RETAINED_ARCHIVE = f"retrozetro-{RETAINED_TAG}-{RETAINED_COMMIT[:12]}-linux-arm64.tar.gz"
RETAINED_DIGEST = "26381fea1112f9357e02648be7dffd4fc0d7661b9f57507884cb1ce9f390149a"
RETAINED_VERIFIER = "5a7e6bb52458e7885dab5040663f364ce402b9a6f9fd72c021565c58544f414d"
RETAINED_CONTRACT = "dd3c339e62edd4fb5fd91b1206a781aeb1823af8ecc66cf67fc8a9b05e78d4a6"
REPOSITORY = "anderson-webops/retrozetrocomics.com"
SCRIPT = Path(__file__).resolve()


def sha256(path):
    with Path(path).open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def command(arguments, **options):
    return subprocess.run(arguments, check=True, **options)


def relay(client, upstream):
    try:
        while True:
            readable, _, _ = select.select([client, upstream], [], [], 30)
            if not readable:
                continue
            for source in readable:
                content = source.recv(65536)
                if not content:
                    return
                (upstream if source is client else client).sendall(content)
    finally:
        upstream.close()


def mongo_fixture_uri(value):
    parsed = urllib.parse.urlsplit(value)
    assert parsed.scheme == "mongodb" and parsed.hostname in {"127.0.0.1", "localhost", "::1"}
    assert (parsed.username or "").startswith("artifact_")
    assert len(parsed.password or "") >= 16
    assert parsed.path.startswith("/retrozetro_artifact_")
    return parsed


def download(url, destination, expected):
    with urllib.request.urlopen(url, timeout=60) as source, destination.open("xb") as target:
        total = 0
        while content := source.read(1024 * 1024):
            total += len(content)
            assert total <= 256 * 1024 * 1024
            target.write(content)
    assert sha256(destination) == expected, f"Retained evidence digest mismatch: {destination.name}"


def run_outer(output, archive):
    assert os.geteuid() != 0
    assert os.environ.get("GITHUB_ACTIONS") == "true"
    assert platform.system() == "Linux" and platform.machine() == "aarch64"
    assert archive.is_file() and archive.parent == output.parent
    assert not output.exists()
    acceptance_path = output.parent / "acceptance.json"
    acceptance = json.loads(acceptance_path.read_text())
    assert acceptance["archive"] == archive.name and acceptance["sha256"] == sha256(archive)
    source_uri = mongo_fixture_uri(os.environ["RETROZETRO_ARTIFACT_MONGODB_URI"])
    output.mkdir(mode=0o755)
    retained = output / "retained"
    retained.mkdir()
    release_url = f"https://github.com/{REPOSITORY}/releases/download/{RETAINED_TAG}"
    source_url = f"https://raw.githubusercontent.com/{REPOSITORY}/{RETAINED_COMMIT}"
    download(f"{release_url}/{RETAINED_ARCHIVE}", retained / RETAINED_ARCHIVE, RETAINED_DIGEST)
    download(f"{source_url}/scripts/runtime-artifact.py", retained / "runtime-artifact.py", RETAINED_VERIFIER)
    download(f"{source_url}/deploy/runtime-artifact.json", retained / "runtime-artifact.json", RETAINED_CONTRACT)
    providers = output / "providers"
    providers.mkdir(mode=0o755)
    rootfs = output / "namespace-root"
    rootfs.mkdir()

    class Provider(socketserver.BaseRequestHandler):
        def handle(self):
            upstream = socket.create_connection((source_uri.hostname, source_uri.port or 27017), timeout=10)
            relay(self.request, upstream)

    previous_directory = Path.cwd()
    os.chdir(providers)
    try:
        server = socketserver.ThreadingUnixStreamServer("mongo.sock", Provider)
        server.daemon_threads = True
        Path("mongo.sock").chmod(0o666)
    finally:
        os.chdir(previous_directory)
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    try:
        command([
            "sudo", "-n", "unshare", "--mount", "--net", "--pid", "--uts",
            "--fork", "--kill-child", "--mount-proc", "--propagation", "private",
            "/usr/bin/env", "-i",
            "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
            f"RETROZETRO_ARTIFACT_MONGODB_URI={urllib.parse.urlunsplit(source_uri)}",
            f"RETROZETRO_FIXTURE_NODE={shutil.which('node')}",
            "/usr/bin/python3", "-I", "-B", str(SCRIPT), "namespace",
            str(output), str(archive), os.readlink("/proc/self/ns/net"),
        ], timeout=300)
    finally:
        server.shutdown()
        server.server_close()
        (providers / "mongo.sock").unlink()
    receipt = json.loads((output / "transition.json").read_text())
    assert receipt["status"] == "passed"
    assert receipt["candidateCommit"] == acceptance["commit"]
    assert receipt["candidateSha256"] == acceptance["sha256"]
    acceptance["retainedReleaseTransition"] = receipt
    acceptance["checks"].append("exact retained/candidate promotion, unchanged repeat, failed activation recovery and acknowledged-write preservation")
    acceptance["harnessSha256"]["scripts/test-runtime-transition.py"] = sha256(SCRIPT)
    acceptance_path.write_text(json.dumps(acceptance, indent=2, sort_keys=True) + "\n")
    print(json.dumps(receipt))


def mount_readonly(source, target):
    if source.is_dir():
        target.mkdir(parents=True, exist_ok=True)
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.touch()
    command(["mount", "--bind", str(source), str(target)])
    command(["mount", "-o", "remount,bind,ro", str(target)])


def namespace(output, archive, original_network):
    assert os.geteuid() == 0
    assert os.readlink("/proc/self/ns/net") != original_network
    rootfs = output / "namespace-root"
    assert rootfs.is_dir() and not any(rootfs.iterdir())
    node = Path(os.environ["RETROZETRO_FIXTURE_NODE"])
    repository = SCRIPT.parent.parent
    command(["mount", "-t", "tmpfs", "-o", "mode=0755,size=768m", "tmpfs", str(rootfs)])
    mount_readonly(Path("/usr"), rootfs / "usr")
    for name in ["lib", "lib64", "bin", "sbin"]:
        source = Path("/") / name
        if source.is_symlink():
            (rootfs / name).symlink_to(os.readlink(source))
        elif source.exists():
            mount_readonly(source, rootfs / name)
    for name in ["state", "etc", "dev", "proc", "tmp", "runtime", "fixtures"]:
        (rootfs / name).mkdir()
    (rootfs / "tmp").chmod(0o1777)
    for name in ["null", "random", "urandom"]:
        mount_readonly(Path("/dev") / name, rootfs / "dev" / name)
    command(["mount", "-t", "proc", "proc", str(rootfs / "proc")])
    command(["mount", "-t", "tmpfs", "tmpfs", str(rootfs / "usr/local")])
    (rootfs / "usr/local/bin").mkdir()
    mount_readonly(node, rootfs / "runtime/node")
    mount_readonly(output / "providers", rootfs / "providers")
    mount_readonly(output / "retained", rootfs / "fixtures/retained")
    mount_readonly(archive, rootfs / "fixtures/candidate.tar.gz")
    mount_readonly(SCRIPT, rootfs / "fixtures/transition.py")
    for source, name in [
        (repository / "deploy/systemd/promote-release.sh", "promote-release.sh"),
        (repository / "scripts/runtime-artifact.py", "runtime-artifact.py"),
        (repository / "deploy/runtime-artifact.json", "runtime-artifact.json"),
    ]:
        mount_readonly(source, rootfs / "fixtures/current" / name)
    (rootfs / "etc/passwd").write_text("root:x:0:0:root:/root:/bin/sh\nretrozetro:x:65534:65534:fixture:/state:/bin/false\n")
    (rootfs / "etc/group").write_text("root:x:0:\nretrozetro:x:65534:\n")
    (rootfs / "etc/hosts").write_text("127.0.0.1 localhost artifact.retrozetro.test api.github.com\n::1 localhost artifact.retrozetro.test\n")
    wrapper = rootfs / "usr/local/bin/systemctl"
    wrapper.write_text('#!/bin/sh\nexec /usr/bin/python3 -I -B /fixtures/transition.py service "$@"\n')
    wrapper.chmod(0o755)
    command(["ip", "link", "set", "lo", "up"])
    with (output / "transition.json").open("x") as stream:
        os.fchmod(stream.fileno(), 0o644)
        os.chroot(rootfs)
        os.chdir("/")
        stream.write(json.dumps(run_isolated(), indent=2, sort_keys=True) + "\n")


def mongo(action, document=None):
    state = json.loads(Path("/state/service.json").read_text())
    javascript = """
import mongoose from '/state/host/current/node_modules/mongoose/index.js';
await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
const collection = mongoose.connection.collection('artifact_transition');
const [action, document] = JSON.parse(await new Promise(resolve => {
  let input = ''; process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => input += chunk); process.stdin.on('end', () => resolve(input));
}));
if (action === 'seed') { await collection.deleteMany({}); await collection.insertOne(document); }
if (action === 'append') await collection.insertOne(document);
if (action === 'drop') await mongoose.connection.dropDatabase();
console.log(JSON.stringify(await collection.find({}).sort({_id:1}).toArray()));
await mongoose.disconnect();
"""
    result = command([
        "/runtime/node", "--input-type=module", "-e", javascript,
    ], input=json.dumps([action, document]), text=True, capture_output=True,
        env={"MONGODB_URI": state["environment"]["MONGODB_URI"]}, timeout=15)
    return json.loads(result.stdout)


def is_running(pid):
    try:
        return Path(f"/proc/{pid}/stat").read_text().split(") ", 1)[1].split()[0] != "Z"
    except FileNotFoundError:
        return False


def service(arguments):
    assert os.geteuid() == 0 and arguments[-1] == "retrozetro-fixture.service"
    state = json.loads(Path("/state/service.json").read_text())
    pid_path = Path("/state/service.pid")
    pid = int(pid_path.read_text()) if pid_path.exists() else None
    if arguments[0] == "is-active":
        return 0 if pid and is_running(pid) else 3
    assert arguments[0] in {"stop", "restart"}
    if pid and is_running(pid):
        os.kill(pid, signal.SIGTERM)
        deadline = time.monotonic() + 20
        while is_running(pid) and time.monotonic() < deadline:
            time.sleep(0.05)
        assert not is_running(pid), "Fixture runtime did not shut down cleanly"
    pid_path.unlink(missing_ok=True)
    if arguments[0] == "stop":
        return 0
    if Path("/state/fail-start").exists():
        Path("/state/fail-start").unlink()
        return 1
    environment = dict(state["environment"])
    for line in Path("/state/host/release.env").read_text().splitlines():
        name, value = line.split("=", 1)
        environment[name] = value
    current = Path("/state/host/current").resolve()
    assert current.is_relative_to("/state/host/releases")
    assert not (current / "back-end/src").exists()
    for name in ["eslint", "tsx", "typescript", "vite", "vitest"]:
        assert not (current / "node_modules" / name).exists()

    with Path("/state/runtime.log").open("ab") as log:
        child = subprocess.Popen([
            "/runtime/node", str(current / "back-end/dist/server.js"),
        ], cwd=current, env=environment, stdout=log, stderr=subprocess.STDOUT,
            user=65534, group=65534, extra_groups=[], start_new_session=True)
    pid_path.write_text(str(child.pid))
    if Path("/state/ack-after-start").exists():
        wait_ready()
        mongo("append", {"_id": "acknowledged", "value": "written-after-candidate-start"})
        Path("/state/host/uploads/retained.txt").write_text("acknowledged upload\n")
        Path("/state/ack-after-start").unlink()
    return 0


def wait_ready():
    deadline = time.monotonic() + 25
    while time.monotonic() < deadline:
        try:
            with urllib.request.urlopen("http://127.0.0.1:3006/readyz", timeout=1) as response:
                if response.status == 200:
                    return
        except (OSError, urllib.error.URLError):
            time.sleep(0.1)
    raise AssertionError("Fixture artifact failed readiness")


def run_isolated():
    assert os.geteuid() == 0 and Path("/fixtures/transition.py").is_file()
    assert not Path("/home/runner").exists()
    source_uri = mongo_fixture_uri(os.environ["RETROZETRO_ARTIFACT_MONGODB_URI"])

    class Relay(socketserver.BaseRequestHandler):
        def handle(self):
            upstream = socket.socket(socket.AF_UNIX)
            upstream.connect("/providers/mongo.sock")
            relay(self.request, upstream)

    server = socketserver.ThreadingTCPServer(("127.0.0.1", 27018), Relay)
    server.daemon_threads = True
    threading.Thread(target=server.serve_forever, daemon=True).start()
    fixture_uri = urllib.parse.urlunsplit(source_uri._replace(
        netloc=f"{source_uri.username}:{source_uri.password}@127.0.0.1:27018",
        path="/retrozetro_artifact_transition",
    ))
    controls = Path("/state/controls")
    controls.mkdir(mode=0o700)
    for name in ["promote-release.sh", "runtime-artifact.py", "runtime-artifact.json"]:
        shutil.copyfile(Path("/fixtures/current") / name, controls / name)
        (controls / name).chmod(0o700 if name.endswith(".sh") else 0o600)
    prior = Path("/state/prior")
    prior.mkdir(mode=0o700)
    for name, digest in [("runtime-artifact.py", RETAINED_VERIFIER), ("runtime-artifact.json", RETAINED_CONTRACT)]:
        shutil.copyfile(Path("/fixtures/retained") / name, prior / name)
        assert sha256(prior / name) == digest
    incoming = Path("/state/incoming")
    incoming.mkdir(mode=0o700)
    shutil.copyfile(Path("/fixtures/retained") / RETAINED_ARCHIVE, incoming / "retained.tar.gz")
    shutil.copyfile("/fixtures/candidate.tar.gz", incoming / "candidate.tar.gz")
    assert sha256(incoming / "retained.tar.gz") == RETAINED_DIGEST
    candidate_sha = sha256(incoming / "candidate.tar.gz")
    Path("/state/tls").mkdir()
    command([
        "openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
        "-config", "/dev/null",
        "-keyout", "/state/tls/key.pem", "-out", "/state/tls/cert.pem",
        "-subj", "/CN=artifact.retrozetro.test",
        "-addext", "subjectAltName=DNS:artifact.retrozetro.test,DNS:api.github.com",
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    policy = Path("/state/nginx.conf")
    policy.write_text('''user retrozetro retrozetro;
pid /state/nginx.pid;
error_log /state/nginx-error.log;
events { worker_connections 128; }
http {
  access_log off;
  client_body_temp_path /state/nginx-body;
  proxy_temp_path /state/nginx-proxy;
  fastcgi_temp_path /state/nginx-fastcgi;
  uwsgi_temp_path /state/nginx-uwsgi;
  scgi_temp_path /state/nginx-scgi;
  server {
    listen 127.0.0.1:443 ssl;
    listen [::1]:443 ssl;
    ssl_certificate /state/tls/cert.pem;
    ssl_certificate_key /state/tls/key.pem;
    server_name artifact.retrozetro.test api.github.com;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; frame-ancestors 'none'" always;
    add_header Strict-Transport-Security 'max-age=63072000; includeSubDomains; preload' always;
    add_header X-Content-Type-Options nosniff always;
    location /repos/ {
      if (-f /state/fail-dispatch) { return 503; }
      return 204;
    }
    location /api/internal/ { return 403; }
    location / {
      proxy_set_header Host artifact.retrozetro.test;
      proxy_set_header X-Forwarded-Proto https;
      proxy_set_header X-Internal-Diagnostics-Key '';
      proxy_pass http://127.0.0.1:3006;
    }
  }
}
''')
    wrapper = Path("/usr/local/bin/nginx")
    wrapper.write_text('#!/bin/sh\nexec /usr/sbin/nginx -c /state/nginx.conf -p /state "$@"\n')
    wrapper.chmod(0o755)
    command(["nginx"])
    token = Path("/state/post-deploy.token")
    token.write_text("synthetic_post_deploy_fixture_token_2026")
    token.chmod(0o600)
    candidate_manifest = None
    scenarios = []
    try:
        for scenario in ["upgrade-repeat", "pre-traffic-failure", "acknowledged-write-failure"]:
            host = Path("/state/host")
            host.mkdir()
            releases = host / "releases"
            releases.mkdir()
            retained = releases / f"retained-{RETAINED_TAG}"
            retained.mkdir()
            prior_env = {"RETROZETRO_RUNTIME_CONTRACT": str(prior / "runtime-artifact.json")}
            command([
                "/usr/bin/python3", "-I", str(prior / "runtime-artifact.py"),
                "unpack", str(retained), "--archive", str(incoming / "retained.tar.gz"),
                "--sha256", RETAINED_DIGEST, "--commit", RETAINED_COMMIT,
            ], env=prior_env, stdout=subprocess.DEVNULL)
            for directory, children, files in os.walk(retained):
                Path(directory).chmod(0o755)
                for name in files:
                    (Path(directory) / name).chmod(0o644)
            (host / "current").symlink_to(retained)
            marker = json.loads((retained / ".retrozetro-release-prepared.json").read_text())
            assert marker["release"] == RETAINED_TAG and marker["commitSha"] == RETAINED_COMMIT
            release_env = host / "release.env"
            release_env.write_text(f'RETROZETRO_RELEASE_VERSION={marker["release"]}\nSOURCE_REVISION={RETAINED_COMMIT}\nDEPLOYED_AT={marker["preparedAt"]}\n')
            release_env.chmod(0o600)
            uploads = host / "uploads"
            uploads.mkdir()
            os.chown(uploads, 65534, 65534)
            (uploads / "retained.txt").write_text("retained upload\n")
            os.chown(uploads / "retained.txt", 65534, 65534)
            environment = {
                "HOST": "127.0.0.1", "PORT": "3006", "NODE_ENV": "production",
                "MONGODB_URI": fixture_uri, "PUBLIC_SITE_ORIGIN": "https://artifact.retrozetro.test",
                "SESSION_SECRET": "retrozetro-artifact-session-secret-2026",
                "INTERNAL_DIAGNOSTICS_KEY": "retrozetro-artifact-diagnostics-key-2026",
                "TRUSTED_PROXY_IPS": "127.0.0.1,::1", "UPLOAD_ROOT": str(uploads),
                "UPLOAD_MIN_FREE_BYTES": "1048576", "UPLOAD_TOTAL_LIMIT_BYTES": "16777216",
                "STATIC_SITE_DIR": "/state/host/current/front-end/dist",
                "WEBAUTHN_ORIGIN": "https://artifact.retrozetro.test", "WEBAUTHN_RP_ID": "artifact.retrozetro.test",
                "PATH": "/runtime:/usr/bin:/bin", "UV_THREADPOOL_SIZE": "2",
                "HOME": "/tmp", "NODE_OPTIONS": "--max-old-space-size=256",
            }
            Path("/state/service.json").write_text(json.dumps({"environment": environment}))
            assert service(["restart", "retrozetro-fixture.service"]) == 0
            wait_ready()
            status = Path(f'/proc/{Path("/state/service.pid").read_text()}/status').read_text()
            assert next(line for line in status.splitlines() if line.startswith("Uid:")).split()[1:] == ["65534"] * 4
            assert int(next(line for line in status.splitlines() if line.startswith("CapEff:")).split()[1], 16) == 0
            before_data = mongo("seed", {"_id": "retained", "value": "before-upgrade"})
            before_env = release_env.read_bytes()
            before_policy = sha256(policy)
            candidate_archive = incoming / "candidate.tar.gz"
            if candidate_manifest is None:
                import tarfile
                with tarfile.open(candidate_archive, "r:gz") as compressed:
                    candidate_manifest = json.load(compressed.extractfile("runtime-manifest.json"))
            promote_env = {
                "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
                "RELEASE_ROOT": str(releases), "CURRENT_LINK": str(host / "current"),
                "RELEASE_ENV_DEST": str(release_env), "SERVICE_NAME": "retrozetro-fixture.service",
                "NODE_BIN": "/runtime/node", "SITE_ORIGIN": "https://artifact.retrozetro.test",
                "SITE_RESOLVE_IPV4": "artifact.retrozetro.test:443:127.0.0.1",
                "SITE_RESOLVE_IPV6": "artifact.retrozetro.test:443:[::1]",
                "GITHUB_POST_DEPLOY_TOKEN_FILE": str(token), "CURL_CA_BUNDLE": "/state/tls/cert.pem",
                "ROLLBACK_ARCHIVE": str(incoming / "retained.tar.gz"),
                "ROLLBACK_SHA256": RETAINED_DIGEST, "ROLLBACK_COMMIT": RETAINED_COMMIT,
                "ROLLBACK_VERIFIER": str(prior / "runtime-artifact.py"),
                "ROLLBACK_CONTRACT": str(prior / "runtime-artifact.json"),
                "ROLLBACK_VERIFIER_SHA256": RETAINED_VERIFIER, "ROLLBACK_CONTRACT_SHA256": RETAINED_CONTRACT,
            }
            promote = ["/bin/bash", str(controls / "promote-release.sh"), str(candidate_archive), candidate_sha, candidate_manifest["commit"]]
            if scenario == "upgrade-repeat":
                recovery = host / ".deployment-recovery"
                recovery.mkdir(mode=0o700)
                pending = recovery / "promotion-previous-uncertain"
                pending.write_text("synthetic unresolved recovery record\n")
                refused = subprocess.run(promote, env=promote_env, capture_output=True, text=True, timeout=30)
                assert refused.returncode != 0 and "recovery is pending" in refused.stderr
                assert pending.read_text() == "synthetic unresolved recovery record\n"
                pending.unlink()
                bad_env = dict(promote_env, ROLLBACK_CONTRACT_SHA256="0" * 64)
                rejected = subprocess.run(promote, env=bad_env, capture_output=True, text=True, timeout=30)
                assert rejected.returncode != 0 and "reviewed digests" in rejected.stderr
                assert (host / "current").resolve() == retained and release_env.read_bytes() == before_env
            elif scenario == "pre-traffic-failure":
                Path("/state/fail-start").touch()
            else:
                Path("/state/ack-after-start").touch()
                Path("/state/fail-dispatch").touch()
            result = subprocess.run(promote, env=promote_env, capture_output=True, text=True, timeout=100)
            if result.returncode != (0 if scenario == "upgrade-repeat" else 1):
                raise AssertionError(f"{scenario} failed: {result.stdout[-2000:]} {result.stderr[-2000:]} {Path('/state/runtime.log').read_text()[-2000:]}")
            wait_ready()
            if scenario == "upgrade-repeat":
                assert (host / "current").resolve() != retained
                before_repeat = (release_env.stat().st_mtime_ns, release_env.read_bytes(), Path("/state/service.pid").read_text(), os.readlink(host / "current"))
                repeated = command(promote, env=promote_env, capture_output=True, text=True, timeout=60)
                assert "Verified unchanged immutable release" in repeated.stdout
                assert before_repeat == (release_env.stat().st_mtime_ns, release_env.read_bytes(), Path("/state/service.pid").read_text(), os.readlink(host / "current"))
            else:
                assert (host / "current").resolve() == retained
                assert release_env.read_bytes() == before_env
            after_data = mongo("read")
            expected_data = before_data + ([{"_id": "acknowledged", "value": "written-after-candidate-start"}] if scenario == "acknowledged-write-failure" else [])
            assert after_data == sorted(expected_data, key=lambda document: document["_id"])
            expected_upload = "acknowledged upload\n" if scenario == "acknowledged-write-failure" else "retained upload\n"
            assert (uploads / "retained.txt").read_text() == expected_upload
            assert sha256(policy) == before_policy
            assert not list((host / ".deployment-recovery").glob("promotion-*"))
            if scenario == "pre-traffic-failure":
                command(promote, env=promote_env, capture_output=True, text=True, timeout=100)
                assert (host / "current").resolve() != retained
            scenarios.append({"name": scenario, "status": "passed"})
            mongo("drop")
            service(["stop", "retrozetro-fixture.service"])
            shutil.rmtree(host)
            Path("/state/fail-dispatch").unlink(missing_ok=True)
        assert sha256(incoming / "retained.tar.gz") == RETAINED_DIGEST
        assert sha256(incoming / "candidate.tar.gz") == candidate_sha
        return {
            "status": "passed", "checkedUTC": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "candidateCommit": candidate_manifest["commit"], "candidateSha256": candidate_sha,
            "retainedCommit": RETAINED_COMMIT, "retainedSha256": RETAINED_DIGEST,
            "retainedVerifierSha256": RETAINED_VERIFIER, "retainedContractSha256": RETAINED_CONTRACT,
            "node": "26.13.1", "scenarios": scenarios,
            "scope": "Synthetic MongoDB records/uploads, exact prior and candidate artifacts, real isolated promoter and dual-stack TLS Nginx; synthetic post-deploy receiver",
            "productionAccess": False, "sourceCheckoutAccessibleToRuntime": False,
            "applicationUid": 65534, "externalNetworkAccessibleToRuntime": False,
        }
    finally:
        if Path("/state/service.json").is_file():
            service(["stop", "retrozetro-fixture.service"])
        command(["nginx", "-s", "quit"])
        server.shutdown()
        server.server_close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("role", choices=["run", "namespace", "service"])
    parser.add_argument("arguments", nargs=argparse.REMAINDER)
    options = parser.parse_args()
    if options.role == "service":
        sys.exit(service(options.arguments))
    elif options.role == "namespace":
        namespace(Path(options.arguments[0]), Path(options.arguments[1]), options.arguments[2])
    else:
        run_outer(Path(options.arguments[0]).resolve(), Path(options.arguments[1]).resolve())
