import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { it } from "vitest";

const require = createRequire(import.meta.url);
const antfu = createRequire(require.resolve("@antfu/eslint-config"));
const pluginEntry = antfu.resolve("eslint-plugin-n");
const plugin = createRequire(pluginEntry);

it("the actual beautifier CLI handles its upgraded glob dependency", async () => {
	const root = new URL("../.ai-work/runs/glob-compatibility/", import.meta.url);
	await mkdir(root, { recursive: true });
	const directory = await mkdtemp(join(fileURLToPath(root), "fixture-"));
	try {
		const filename = join(directory, "fixture-input.js");
		await writeFile(filename, "const answer=42;");
		const metadata = require("js-beautify/package.json");
		const binary = join(dirname(require.resolve("js-beautify/package.json")), metadata.bin["js-beautify"]);
		execFileSync(process.execPath, [binary, "--replace", join(directory, "fixture-*.js")], { timeout: 30_000, maxBuffer: 1024 * 1024 });
		const { readFile } = await import("node:fs/promises");
		assert.match(await readFile(filename, "utf8"), /const answer = 42;/u);
	}
	finally {
		await rm(directory, { recursive: true });
	}
});

it("the actual formatter CLI runs its upgraded worker pool on one thread", () => {
	const formatter = createRequire(require.resolve("eslint-plugin-format"));
	const binary = join(dirname(dirname(formatter.resolve("oxfmt"))), "bin/oxfmt");
	const output = execFileSync(process.execPath, [binary, "--threads=1", "--stdin-filepath=fixture.ts"], {
		input: "const answer:number=42\n",
		encoding: "utf8",
		timeout: 30_000,
		maxBuffer: 1024 * 1024
	});
	assert.match(output, /const answer: number = 42/u);
});

it("the actual Node lint plugin reads workspace fixtures with JS-YAML 5", async () => {
	const yaml = plugin("js-yaml");
	assert.match(plugin("js-yaml/package.json").version, /^5\./u);
	assert.deepEqual(yaml.load("packages:\n  - front-end\n  - back-end\n"), { packages: ["front-end", "back-end"] });
	assert.throws(() => yaml.load("value: 1\nvalue: 2\n"));
	assert.throws(() => yaml.load("value: !!js/function 'function () {}'"));
	const fixtureRoot = new URL("../.ai-work/runs/yaml-compatibility/", import.meta.url);
	await mkdir(fixtureRoot, { recursive: true });
	const directory = await mkdtemp(join(fileURLToPath(fixtureRoot), "fixture-"));
	try {
		await writeFile(join(directory, "pnpm-workspace.yaml"), "packages:\n  - front-end\n  - back-end\n");
		const helper = await import(pathToFileURL(join(dirname(pluginEntry), "util/get-pnpm-workspace-yaml.js")));
		assert.deepEqual(helper.getPnpmWorkspacePatterns(directory), ["front-end", "back-end"]);
	}
	finally {
		await rm(directory, { recursive: true });
	}
});

it("the Markdown math consumer uses maintained KaTeX without trusted script links", async () => {
	const math = createRequire(antfu.resolve("micromark-extension-math"));
	const katex = math("katex");
	assert.match(katex.version, /^0\.19\./u);
	assert.match(katex.renderToString("\\frac{a}{b}", { displayMode: true }), /katex-display/u);
	const unsafe = katex.renderToString("\\href{javascript:alert(1)}{text}", { trust: false, throwOnError: false });
	assert.doesNotMatch(unsafe, /href="javascript:|<script/iu);
	const { micromark } = await import(pathToFileURL(antfu.resolve("micromark")));
	const { math: mathSyntax, mathHtml } = await import(pathToFileURL(antfu.resolve("micromark-extension-math")));
	assert.match(micromark("$a+b$", { extensions: [mathSyntax()], htmlExtensions: [mathHtml()] }), /class="katex/u);
});
