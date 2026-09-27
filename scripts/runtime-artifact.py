#!/usr/bin/env python3
"""Build and verify an immutable RetroZetro Linux ARM64 runtime artifact."""

import argparse
import datetime
import gzip
import hashlib
import json
import os
import platform
import re
import stat
import tarfile
from pathlib import Path, PurePosixPath


REPO_ROOT = Path(__file__).resolve().parent.parent
CONTRACT_PATH = Path(
    os.environ.get(
        "RETROZETRO_RUNTIME_CONTRACT",
        REPO_ROOT / "deploy/runtime-artifact.json",
    )
).resolve()
MANIFEST = "runtime-manifest.json"
IDENTITY = ".retrozetro-release-prepared.json"
SEMVER = re.compile(r"^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$")
COMMIT = re.compile(r"^[0-9a-f]{40}$")
TIMESTAMP = re.compile(
    r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$"
)
FORBIDDEN_NAMES = {
    ".env",
    ".htpasswd",
    "credentials.json",
    "id_rsa",
    "id_ed25519",
}
FORBIDDEN_SUFFIXES = {
    ".db",
    ".key",
    ".pem",
    ".p12",
    ".pfx",
    ".sqlite",
    ".sqlite3",
}
DEVELOPMENT_PACKAGES = {
    "cypress",
    "eslint",
    "puppeteer",
    "tsx",
    "typescript",
    "vite",
    "vitest",
}


def load_contract():
    value = json.loads(CONTRACT_PATH.read_text())
    if not isinstance(value, dict) or value.get("version") != 1:
        raise ValueError("unsupported runtime artifact contract")
    return value


CONTRACT = load_contract()


def digest(path):
    value = hashlib.sha256()
    with Path(path).open("rb") as source:
        while chunk := source.read(1024 * 1024):
            value.update(chunk)
    return value.hexdigest()


def contract_digest():
    return digest(CONTRACT_PATH)


def normalized_name(name):
    if (
        not isinstance(name, str)
        or name.startswith("/")
        or any(part in ("", ".", "..") for part in name.split("/"))
    ):
        raise ValueError(f"unsafe artifact path: {name}")
    path = PurePosixPath(name)
    if path.is_absolute() or not path.parts:
        raise ValueError(f"unsafe artifact path: {name}")
    return path.as_posix()


def permitted(name):
    name = normalized_name(name)
    if name in CONTRACT["allowedFiles"]:
        return True
    return any(
        name == root or name.startswith(root + "/")
        for root in CONTRACT["allowedRoots"]
    )


def forbidden(name):
    path = PurePosixPath(name)
    lowered_parts = [part.lower() for part in path.parts]
    basename = lowered_parts[-1]
    if basename in FORBIDDEN_NAMES or basename.startswith(".env."):
        return True
    if PurePosixPath(basename).suffix in FORBIDDEN_SUFFIXES:
        return True
    return any(
        part in {"uploads", "spool", "writable-state"}
        for part in lowered_parts
    )


def file_record(path):
    mode = stat.S_IMODE(path.lstat().st_mode)
    return {
        "mode": f"{mode:04o}",
        "sha256": digest(path),
        "size": path.stat().st_size,
    }


def inventory(root):
    root = Path(root)
    files = {}
    allowed_executables = set(CONTRACT["allowedExecutables"])

    for path in sorted(root.rglob("*")):
        name = path.relative_to(root).as_posix()
        metadata = path.lstat()
        mode = stat.S_IMODE(metadata.st_mode)

        if path.is_symlink() or not (
            stat.S_ISDIR(metadata.st_mode) or stat.S_ISREG(metadata.st_mode)
        ):
            raise ValueError(f"unsafe artifact object: {name}")
        if mode & 0o7022:
            raise ValueError(f"unsafe artifact mode: {name}")
        if stat.S_ISDIR(metadata.st_mode):
            continue
        if metadata.st_nlink != 1:
            raise ValueError(f"hard-linked artifact file: {name}")
        if name == MANIFEST:
            continue
        if not permitted(name):
            raise ValueError(f"file outside runtime contract: {name}")
        if forbidden(name):
            raise ValueError(
                f"forbidden private or writable artifact file: {name}"
            )
        if mode & 0o111 and name not in allowed_executables:
            raise ValueError(f"unexpected executable artifact file: {name}")
        files[name] = file_record(path)

    return files


def read_json(path, label):
    try:
        value = json.loads(Path(path).read_text())
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"invalid {label}") from error
    if not isinstance(value, dict):
        raise ValueError(f"invalid {label}")
    return value


def validate_identity(root, manifest):
    package = read_json(root / "package.json", "root package manifest")
    frontend = read_json(
        root / "front-end/package.json", "front-end package manifest"
    )
    backend = read_json(
        root / "back-end/package.json", "back-end package manifest"
    )
    identity = read_json(root / IDENTITY, "release identity")
    release_json = read_json(
        root / "front-end/dist/release.json", "front-end release identity"
    )
    versions = {
        package.get("version"),
        frontend.get("version"),
        backend.get("version"),
    }
    if len(versions) != 1 or not SEMVER.fullmatch(
        str(package.get("version", ""))
    ):
        raise ValueError(
            "workspace package versions disagree or are not semantic versions"
        )
    release = "v" + package["version"]
    if set(identity) != {"commitSha", "preparedAt", "release"}:
        raise ValueError("invalid release identity fields")
    if (
        identity.get("release") != release
        or identity.get("commitSha") != manifest["commit"]
    ):
        raise ValueError(
            "release identity does not match package version and source commit"
        )
    prepared_at = identity.get("preparedAt", "")
    if not TIMESTAMP.fullmatch(prepared_at):
        raise ValueError("invalid release identity timestamp")
    try:
        datetime.datetime.fromisoformat(prepared_at.replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("invalid release identity timestamp") from error
    if (
        release_json.get("revision") != manifest["commit"]
        or release_json.get("version") != package["version"]
    ):
        raise ValueError("compiled release identity differs from the artifact")


def package_directories(root):
    for package_file in sorted((root / "node_modules").glob("**/package.json")):
        relative = package_file.parent.relative_to(root).as_posix()
        parts = PurePosixPath(relative).parts
        if "node_modules" not in parts:
            continue
        package_index = len(parts) - 1
        if package_index > 0 and parts[package_index - 1].startswith("@"):
            package_index -= 1
        if package_index == 0 or parts[package_index - 1] != "node_modules":
            continue
        yield relative, package_file


def resolve_package_directory(root, importer, dependency):
    current = Path(importer)
    while root == current or root in current.parents:
        candidate = current / "node_modules" / dependency
        if (candidate / "package.json").is_file():
            return candidate
        if current == root:
            break
        current = current.parent
    return None


def runtime_dependency_closure(root):
    root = Path(root).resolve(strict=True)
    backend = read_json(
        root / "back-end/package.json", "back-end package manifest"
    )
    queue = [
        (root / "back-end", name, False)
        for name in backend.get("dependencies", {})
    ]
    visited = set()

    while queue:
        importer, dependency, optional = queue.pop()
        package_dir = resolve_package_directory(root, importer, dependency)
        if package_dir is None:
            if optional:
                continue
            raise ValueError(f"production dependency missing: {dependency}")
        relative = package_dir.relative_to(root).as_posix()
        if relative in visited:
            continue
        visited.add(relative)
        package = read_json(
            package_dir / "package.json", f"runtime package {relative}"
        )
        for child in package.get("dependencies", {}):
            queue.append((package_dir, child, False))
        for child in package.get("optionalDependencies", {}):
            queue.append((package_dir, child, True))
        peer_meta = package.get("peerDependenciesMeta", {})
        for child in package.get("peerDependencies", {}):
            queue.append(
                (
                    package_dir,
                    child,
                    bool(peer_meta.get(child, {}).get("optional")),
                )
            )

    return visited


def validate_dependencies(root):
    lock = read_json(root / "package-lock.json", "package lock")
    backend = read_json(
        root / "back-end/package.json", "back-end package manifest"
    )
    lock_packages = lock.get("packages")
    if lock.get("lockfileVersion") != 3 or not isinstance(lock_packages, dict):
        raise ValueError("runtime requires a package-lock v3 install contract")
    lock_backend = lock_packages.get("back-end", {})
    if lock_backend.get("dependencies", {}) != backend.get("dependencies", {}):
        raise ValueError("back-end package and root lock dependencies disagree")

    observed_packages = set()
    for relative, package_file in package_directories(root):
        observed_packages.add(relative)
        lock_entry = lock_packages.get(relative)
        if not isinstance(lock_entry, dict):
            raise ValueError(
                f"runtime package is absent from lockfile: {relative}"
            )
        if lock_entry.get("dev") is True:
            raise ValueError(f"development dependency in runtime: {relative}")
        package_name = str(
            read_json(package_file, f"runtime package {relative}").get(
                "name", ""
            )
        )
        if package_name.rsplit("/", 1)[-1] in DEVELOPMENT_PACKAGES:
            raise ValueError(f"development tool in runtime: {relative}")
    if observed_packages != runtime_dependency_closure(root):
        raise ValueError(
            "runtime dependencies differ from the back-end production closure"
        )


def is_native_binary(name):
    basename = PurePosixPath(name).name
    return basename.endswith(".node") or ".so." in basename or basename.endswith(".so")


def validate(root, manifest):
    root = Path(root).resolve(strict=True)
    required_fields = {
        "commit",
        "contractSha256",
        "contractVersion",
        "files",
        "format",
    }
    if not isinstance(manifest, dict) or set(manifest) != required_fields:
        raise ValueError("invalid runtime manifest fields")
    if (
        manifest.get("format") != 1
        or manifest.get("contractVersion") != CONTRACT["version"]
    ):
        raise ValueError("unsupported runtime manifest")
    if manifest.get("contractSha256") != contract_digest():
        raise ValueError("runtime contract digest mismatch")
    if not COMMIT.fullmatch(str(manifest.get("commit", ""))):
        raise ValueError("invalid source commit")
    if not isinstance(manifest.get("files"), dict):
        raise ValueError("invalid runtime file inventory")

    actual = inventory(root)
    if actual != manifest["files"]:
        raise ValueError("runtime file inventory or hashes differ")
    for name in CONTRACT["required"]:
        if name not in actual or not (root / name).is_file():
            raise ValueError(f"required runtime path missing: {name}")
    for entrypoint in CONTRACT["entrypoints"]:
        if entrypoint not in actual:
            raise ValueError(f"runtime entrypoint missing: {entrypoint}")
    observed_native = sorted(name for name in actual if is_native_binary(name))
    if observed_native != sorted(CONTRACT["nativeBindings"]):
        raise ValueError(
            "native binding inventory differs from reviewed contract"
        )

    validate_identity(root, manifest)
    validate_dependencies(root)
    return manifest


def safe_archive_members(archive):
    members = archive.getmembers()
    normalized = [normalized_name(member.name) for member in members]
    if len(members) != len(set(normalized)) or len(members) > 100_000:
        raise ValueError("archive has duplicate or excessive members")
    if sum(member.size for member in members) > 1024 * 1024 * 1024:
        raise ValueError("archive exceeds the one-gibibyte unpacked limit")
    allowed_executables = set(CONTRACT["allowedExecutables"])
    for member in members:
        name = normalized_name(member.name)
        if not member.isfile() or (
            name != MANIFEST and not permitted(name)
        ):
            raise ValueError(f"unsafe archive member: {name}")
        mode = member.mode & 0o7777
        if mode & 0o7022 or (
            mode & 0o111 and name not in allowed_executables
        ):
            raise ValueError(f"unsafe archive mode: {name}")
    return members


def verified_archive_manifest(archive):
    members = safe_archive_members(archive)
    by_name = {normalized_name(member.name): member for member in members}
    manifest_member = by_name.get(MANIFEST)
    if not manifest_member:
        raise ValueError("trusted archive has no runtime manifest")
    try:
        with archive.extractfile(manifest_member) as source:
            manifest = json.load(source)
    except (
        OSError,
        json.JSONDecodeError,
        UnicodeDecodeError,
        TypeError,
    ) as error:
        raise ValueError(
            "trusted archive has an invalid runtime manifest"
        ) from error
    if not isinstance(manifest, dict) or not isinstance(
        manifest.get("files"), dict
    ):
        raise ValueError("trusted archive has an invalid runtime manifest")
    expected_names = {MANIFEST, *manifest["files"]}
    if set(by_name) != expected_names:
        raise ValueError(
            "trusted archive members differ from its runtime manifest"
        )

    for name, expected in manifest["files"].items():
        member = by_name.get(normalized_name(name))
        if not isinstance(expected, dict) or not member:
            raise ValueError(f"invalid archive manifest entry: {name}")
        value = hashlib.sha256()
        with archive.extractfile(member) as source:
            while chunk := source.read(1024 * 1024):
                value.update(chunk)
        actual = {
            "mode": f"{member.mode & 0o7777:04o}",
            "sha256": value.hexdigest(),
            "size": member.size,
        }
        if actual != expected:
            raise ValueError(
                "trusted archive member differs from its runtime manifest: "
                + name
            )
    return manifest


def write_archive(root, archive_path, manifest):
    with archive_path.open("xb") as raw:
        with gzip.GzipFile(fileobj=raw, mode="wb", mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w") as archive:
                for name in sorted([MANIFEST, *manifest["files"]]):
                    path = root / name
                    info = archive.gettarinfo(path, arcname=name)
                    info.uid = 0
                    info.gid = 0
                    info.uname = "root"
                    info.gname = "root"
                    info.mtime = 0
                    with path.open("rb") as source:
                        archive.addfile(info, source)


def unpack(root, archive_path, expected_sha, expected_commit):
    if digest(archive_path) != expected_sha or any(root.iterdir()):
        raise ValueError("archive hash mismatch or destination is not empty")
    with tarfile.open(archive_path, "r:gz") as archive:
        manifest = verified_archive_manifest(archive)
        for member in archive.getmembers():
            target = root / normalized_name(member.name)
            target.parent.mkdir(parents=True, exist_ok=True, mode=0o755)
            with archive.extractfile(member) as source, target.open("xb") as output:
                while chunk := source.read(1024 * 1024):
                    output.write(chunk)
            target.chmod(member.mode & 0o777)
    manifest = validate(root, manifest)
    if manifest["commit"] != expected_commit:
        raise ValueError("artifact source identity mismatch")
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=["pack", "unpack", "verify"])
    parser.add_argument("tree", type=Path)
    parser.add_argument("--archive", type=Path)
    parser.add_argument("--commit")
    parser.add_argument("--sha256")
    args = parser.parse_args()
    root = args.tree.resolve(strict=True)

    if args.operation == "pack":
        if platform.system() != "Linux" or platform.machine() not in {
            "aarch64",
            "arm64",
        }:
            raise ValueError(
                "production artifacts must be built on Linux ARM64"
            )
        if (
            not args.archive
            or not args.commit
            or not COMMIT.fullmatch(args.commit)
        ):
            parser.error(
                "pack requires --archive and a 40-character --commit"
            )
        if args.archive.exists():
            raise ValueError("never overwrite an existing artifact")
        manifest = {
            "commit": args.commit,
            "contractSha256": contract_digest(),
            "contractVersion": CONTRACT["version"],
            "files": inventory(root),
            "format": 1,
        }
        validate(root, manifest)
        (root / MANIFEST).write_text(
            json.dumps(manifest, indent=2, sort_keys=True) + "\n"
        )
        write_archive(root, args.archive, manifest)
        print(json.dumps({
            "archive": args.archive.name,
            "commit": args.commit,
            "files": len(manifest["files"]),
            "sha256": digest(args.archive),
        }, sort_keys=True))
        return

    if args.operation == "unpack":
        if not args.archive or not args.sha256 or not args.commit:
            parser.error(
                "unpack requires --archive, --sha256, and --commit"
            )
        manifest = unpack(root, args.archive, args.sha256, args.commit)
        print(json.dumps({
            "commit": manifest["commit"],
            "files": len(manifest["files"]),
            "unpacked": True,
        }, sort_keys=True))
        return

    declared = read_json(root / MANIFEST, "runtime manifest")
    if args.archive or args.sha256:
        if (
            not args.archive
            or not args.sha256
            or digest(args.archive) != args.sha256
        ):
            raise ValueError("trusted archive checksum mismatch")
        with tarfile.open(args.archive, "r:gz") as archive:
            trusted = verified_archive_manifest(archive)
        if declared != trusted:
            raise ValueError("staged manifest differs from trusted archive")
    manifest = validate(root, declared)
    if args.commit and manifest["commit"] != args.commit:
        raise ValueError("artifact source identity mismatch")
    print(json.dumps({
        "commit": manifest["commit"],
        "files": len(manifest["files"]),
        "verified": True,
    }, sort_keys=True))


if __name__ == "__main__":
    main()
