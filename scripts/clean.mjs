import { rm } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);
const generatedPaths = [
	"node_modules",
	"front-end/node_modules",
	"front-end/dist",
	"back-end/node_modules",
	"back-end/dist",
	"back-end/tsconfig.tsbuildinfo"
];

for (const relativePath of generatedPaths) {
	const target = path.resolve(repositoryRoot, relativePath);
	if (!target.startsWith(`${repositoryRoot}${path.sep}`)) {
		throw new Error(`Refusing to clean a path outside the repository: ${target}`);
	}

	await rm(target, { force: true, recursive: true });
}

process.stdout.write("Removed generated dependencies and build output; lockfiles were preserved.\n");
