#!/usr/bin/env python3
"""Regression tests for the RetroZetro immutable runtime artifact contract."""

import importlib.util
import json
import os
from pathlib import Path
import tarfile
import tempfile
import unittest


SCRIPT = Path(__file__).with_name("runtime-artifact.py")
SPEC = importlib.util.spec_from_file_location("runtime_artifact", SCRIPT)
artifact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(artifact)


class RuntimeArtifactTests(unittest.TestCase):
    commit = "a" * 40
    version = "2.10.0"

    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name) / "runtime"
        self.root.mkdir()
        package_dependencies = {
            "@img/sharp-libvips-linux-arm64": "1.3.3",
            "@img/sharp-linux-arm64": "0.35.4",
            "argon2": "0.45.1",
            "express": "5.2.1",
            "mongoose": "9.9.1",
            "sharp": "0.35.4",
        }
        files = {
            "package.json": {
                "name": "fixture",
                "version": self.version,
            },
            "front-end/package.json": {
                "name": "front-end",
                "version": self.version,
            },
            "back-end/package.json": {
                "name": "back-end",
                "version": self.version,
                "dependencies": package_dependencies,
            },
            artifact.IDENTITY: {
                "commitSha": self.commit,
                "preparedAt": "2026-09-27T12:00:00Z",
                "release": f"v{self.version}",
            },
            "front-end/dist/release.json": {
                "releasedAt": "2026-09-27T11:00:00.000Z",
                "revision": self.commit,
                "version": self.version,
            },
            "package-lock.json": {
                "lockfileVersion": 3,
                "packages": {
                    "": {"version": self.version},
                    "back-end": {"dependencies": package_dependencies},
                    "front-end": {},
                    "node_modules/@img/sharp-libvips-linux-arm64": {
                        "version": "1.3.3"
                    },
                    "node_modules/@img/sharp-linux-arm64": {
                        "version": "0.35.4"
                    },
                    "node_modules/argon2": {"version": "0.45.1"},
                    "node_modules/express": {"version": "5.2.1"},
                    "node_modules/mongoose": {"version": "9.9.1"},
                    "node_modules/sharp": {"version": "0.35.4"},
                },
            },
        }
        text_files = {
            "front-end/dist/index.html": "<!doctype html><title>fixture</title>",
            "back-end/dist/server.js": "console.log('fixture')\n",
            "back-end/dist/app.js": "export {}\n",
            "back-end/dist/admin-lifecycle.js": "console.log('fixture')\n",
            "back-end/dist/public-renderer/entry-server.mjs": "export {}\n",
            "node_modules/@img/sharp-libvips-linux-arm64/lib/libvips-cpp.so.8.18.6": "fixture-libvips",
            "node_modules/@img/sharp-linux-arm64/lib/sharp-linux-arm64-0.35.4.node": "fixture-sharp",
            "node_modules/argon2/prebuilds/linux-arm64/argon2.armv8.glibc.node": "fixture-argon2",
        }
        for name, value in files.items():
            self.write(name, json.dumps(value) + "\n")
        for name, value in text_files.items():
            self.write(name, value)
        for package_name, version in package_dependencies.items():
            self.write(
                f"node_modules/{package_name}/package.json",
                json.dumps({"name": package_name, "version": version}) + "\n",
            )
        self.normalize_modes()

    def tearDown(self):
        self.temporary.cleanup()

    def write(self, name, value):
        target = self.root / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(value)

    def normalize_modes(self):
        for path in self.root.rglob("*"):
            path.chmod(0o755 if path.is_dir() else 0o644)

    def manifest(self):
        return {
            "commit": self.commit,
            "contractSha256": artifact.contract_digest(),
            "contractVersion": artifact.CONTRACT["version"],
            "files": artifact.inventory(self.root),
            "format": 1,
        }

    def add_manifest(self):
        manifest = self.manifest()
        (self.root / artifact.MANIFEST).write_text(
            json.dumps(manifest, sort_keys=True) + "\n"
        )
        return manifest

    def test_accepts_complete_reviewed_runtime(self):
        artifact.validate(self.root, self.manifest())

    def test_rejects_hash_drift(self):
        manifest = self.manifest()
        (self.root / "back-end/dist/server.js").write_text("tampered\n")
        with self.assertRaisesRegex(ValueError, "hashes differ"):
            artifact.validate(self.root, manifest)

    def test_rejects_links_and_hard_links(self):
        target = self.root / "back-end/dist/server.js"
        symbolic = self.root / "back-end/dist/linked.js"
        symbolic.symlink_to(target)
        with self.assertRaisesRegex(ValueError, "unsafe artifact object"):
            artifact.inventory(self.root)
        symbolic.unlink()

        hard = self.root / "back-end/dist/hard.js"
        os.link(target, hard)
        with self.assertRaisesRegex(ValueError, "hard-linked artifact file"):
            artifact.inventory(self.root)

    def test_rejects_private_files_and_unreviewed_native_bindings(self):
        secret = self.root / "back-end/dist/.env"
        secret.write_text("SECRET=value\n")
        with self.assertRaisesRegex(ValueError, "forbidden private"):
            artifact.inventory(self.root)
        secret.unlink()

        self.write("node_modules/argon2/extra.node", "unreviewed")
        self.normalize_modes()
        with self.assertRaisesRegex(ValueError, "native binding inventory"):
            artifact.validate(self.root, self.manifest())

    def test_rejects_development_or_unlocked_runtime_packages(self):
        lock_path = self.root / "package-lock.json"
        lock = json.loads(lock_path.read_text())
        lock["packages"]["node_modules/express"]["dev"] = True
        lock_path.write_text(json.dumps(lock) + "\n")
        with self.assertRaisesRegex(ValueError, "development dependency"):
            artifact.validate(self.root, self.manifest())

    def test_archive_round_trip_is_digest_and_commit_bound(self):
        manifest = self.add_manifest()
        archive_path = Path(self.temporary.name) / "runtime.tar.gz"
        artifact.write_archive(self.root, archive_path, manifest)
        archive_sha = artifact.digest(archive_path)
        unpacked = Path(self.temporary.name) / "unpacked"
        unpacked.mkdir()
        result = artifact.unpack(
            unpacked, archive_path, archive_sha, self.commit
        )
        self.assertEqual(result, manifest)
        with self.assertRaisesRegex(ValueError, "archive hash mismatch"):
            empty = Path(self.temporary.name) / "wrong-sha"
            empty.mkdir()
            artifact.unpack(empty, archive_path, "0" * 64, self.commit)

    def test_rejects_archive_traversal(self):
        archive_path = Path(self.temporary.name) / "unsafe.tar.gz"
        payload = Path(self.temporary.name) / "payload"
        payload.write_text("unsafe")
        with tarfile.open(archive_path, "w:gz") as archive:
            archive.add(payload, arcname="../escape")
        with tarfile.open(archive_path, "r:gz") as archive:
            with self.assertRaisesRegex(ValueError, "unsafe artifact path"):
                artifact.safe_archive_members(archive)

    def test_rejects_identity_drift(self):
        identity = self.root / artifact.IDENTITY
        value = json.loads(identity.read_text())
        value["commitSha"] = "b" * 40
        identity.write_text(json.dumps(value) + "\n")
        with self.assertRaisesRegex(ValueError, "release identity"):
            artifact.validate(self.root, self.manifest())


if __name__ == "__main__":
    unittest.main()
