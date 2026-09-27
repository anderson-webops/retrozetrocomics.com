#!/usr/bin/env python3
"""Copy only RetroZetro's root-lock-backed backend production closure."""

import argparse
import importlib.util
from pathlib import Path
import shutil


SCRIPT = Path(__file__).with_name("runtime-artifact.py")
SPEC = importlib.util.spec_from_file_location("runtime_artifact", SCRIPT)
artifact = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(artifact)


def copy_package(source, destination):
    for path in source.rglob("*"):
        if path.is_symlink():
            raise ValueError(
                f"production dependency contains a symbolic link: {path}"
            )

    def ignore_nested_modules(_directory, names):
        return {"node_modules"} if "node_modules" in names else set()

    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copytree(
        source,
        destination,
        ignore=ignore_nested_modules,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()
    source = args.source.resolve(strict=True)
    destination = args.destination.resolve(strict=True)
    if any(destination.iterdir()):
        raise ValueError("production dependency destination must be empty")

    closure = artifact.runtime_dependency_closure(source)
    lock = artifact.read_json(
        source / "package-lock.json", "package lock"
    )["packages"]
    for relative in sorted(
        closure, key=lambda name: (name.count("/"), name)
    ):
        entry = lock.get(relative)
        if not isinstance(entry, dict) or entry.get("dev") is True:
            raise ValueError(
                "production closure is not backed by a non-development "
                f"lock entry: {relative}"
            )
        copy_package(source / relative, destination.parent / relative)

    print("Copied " + str(len(closure)) + " locked production packages.")


if __name__ == "__main__":
    main()
