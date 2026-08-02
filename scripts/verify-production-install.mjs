import { spawnSync } from "node:child_process";
import { access, copyFile, cp, mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import process from "node:process";

const repositoryRoot = new URL("../", import.meta.url);
const temporaryDirectory = await mkdtemp(join(tmpdir(), "retrozetro-production-"));
const npmExecPath = process.env.npm_execpath;

if (!npmExecPath) {
	throw new Error("Run production-install verification through npm so the selected npm executable is known.");
}

function runNpm(arguments_) {
	const env = { ...process.env };
	delete env.npm_config_global_ignore_file;
	delete env.NPM_CONFIG_GLOBAL_IGNORE_FILE;

	const result = spawnSync(process.execPath, [npmExecPath, ...arguments_], {
		cwd: temporaryDirectory,
		encoding: "utf8",
		env,
		maxBuffer: 10 * 1024 * 1024
	});
	if (result.stdout) process.stdout.write(result.stdout);
	if (result.stderr) process.stderr.write(result.stderr);
	if (result.status !== 0) {
		throw new Error(`npm ${arguments_.join(" ")} failed with exit code ${result.status}`);
	}
}

async function exists(target) {
	try {
		await access(target);
		return true;
	}
	catch {
		return false;
	}
}

try {
	for (const file of ["package.json", "package-lock.json", ".npmrc"]) {
		await copyFile(new URL(file, repositoryRoot), join(temporaryDirectory, file));
	}
	for (const workspace of ["back-end", "front-end"]) {
		await cp(
			new URL(`${workspace}/package.json`, repositoryRoot),
			join(temporaryDirectory, workspace, "package.json"),
			{ recursive: true }
		);
	}
	await cp(
		new URL("back-end/dist", repositoryRoot),
		join(temporaryDirectory, "back-end", "dist"),
		{ recursive: true }
	);

	runNpm([
		"ci",
		"--include=prod",
		"--omit=dev",
		"--omit=optional",
		"--workspace",
		"back-end",
		"--include-workspace-root=false",
		"--ignore-scripts",
		"--no-fund",
		"--no-audit"
	]);
	runNpm([
		"rebuild",
		"argon2",
		"--workspace",
		"back-end",
		"--foreground-scripts",
		"--no-fund",
		"--no-audit"
	]);
	runNpm([
		"audit",
		"--include=prod",
		"--omit=dev",
		"--omit=optional",
		"--workspace",
		"back-end",
		"--audit-level=high"
	]);
	runNpm([
		"prune",
		"--include=prod",
		"--omit=dev",
		"--omit=optional",
		"--workspace",
		"back-end",
		"--include-workspace-root=false",
		"--no-fund",
		"--no-audit"
	]);

	const omitted = ["typescript", "tsx", "esbuild", "vite", "vitest"];
	for (const packageName of omitted) {
		for (const modulesRoot of [
			join(temporaryDirectory, "node_modules"),
			join(temporaryDirectory, "back-end", "node_modules")
		]) {
			await rm(join(modulesRoot, packageName), { force: true, recursive: true });
			await rm(join(modulesRoot, ".bin", packageName), { force: true, recursive: true });
		}
	}

	const backEndPackage = JSON.parse(
		await readFile(join(temporaryDirectory, "back-end", "package.json"), "utf8")
	);
	const requireFromInstall = createRequire(
		join(temporaryDirectory, "back-end", "package.json")
	);
	const isolatedInstallRoot = await realpath(temporaryDirectory);
	const installed = [];

	for (const packageName of Object.keys(backEndPackage.dependencies)) {
		const resolved = await realpath(requireFromInstall.resolve(packageName));
		const localPath = relative(isolatedInstallRoot, resolved);
		if (localPath.startsWith("..")) {
			throw new Error(`${packageName} resolved outside the isolated production install`);
		}
		requireFromInstall(packageName);
		installed.push(packageName);
	}

	await import(new URL(`file://${join(temporaryDirectory, "back-end", "dist", "app.js")}`));

	for (const packageName of omitted) {
		if (
			await exists(join(temporaryDirectory, "node_modules", packageName))
			|| await exists(join(temporaryDirectory, "back-end", "node_modules", packageName))
		) {
			throw new Error(`${packageName} must not be installed in the production-only tree`);
		}
	}

	console.log(JSON.stringify({
		installed: installed.sort(),
		omitted,
		productionInstall: "passed",
		runtimeImport: "back-end/dist/app.js"
	}));
}
finally {
	await rm(temporaryDirectory, { force: true, recursive: true });
}
