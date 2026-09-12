import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repositoryRoot = path.resolve(new URL("../", import.meta.url).pathname);
const relativePaths = {
	artworkIndex: "front-end/src/content/tylerArtwork.ts",
	artworkPage: "front-end/src/pages/artwork.vue",
	ci: ".github/workflows/ci.yml",
	contentHandoff: "deploy/content/SERVER_AI_HANDOFF.md",
	contentManifest: "deploy/content/tyler-site-content-v1.json",
	environment: "deploy/systemd/retrozetro.env.example",
	homePage: "front-end/src/pages/index.vue",
	locale: "front-end/locales/en.json",
	install: "deploy/systemd/install-service.sh",
	legacyRuntime: "back-end/src/config/legacyDeployment.ts",
	mainStyles: "front-end/src/styles/main.css",
	nginx: "deploy/nginx/retrozetro.locations.conf",
	npmHelper: "scripts/run-pinned-npm.mjs",
	ownerStaticSecurity: "scripts/write-owner-static-security.mjs",
	installPolicy: "scripts/verify-install-script-policy.mjs",
	prepare: "deploy/systemd/prepare-release.sh",
	promote: "deploy/systemd/promote-release.sh",
	releaseMetadata: "scripts/write-release-metadata.mjs",
	releaseWorkflow: ".github/workflows/release-source.yml",
	runtimeServer: "back-end/src/server.ts",
	service: "deploy/systemd/retrozetro.service",
	siteAdSlot: "front-end/src/components/SiteAdSlot.vue",
	startupDiagnostics: "scripts/verify-startup-diagnostics.mjs",
	storage: "back-end/src/services/storage.ts",
	worldEntryCards: "front-end/src/components/WorldEntryCards.vue",
	worldEntryPresentation: "front-end/src/content/worldEntryPresentation.ts",
	worldsData: "front-end/src/content/retroverseWorlds.ts",
	worldsPage: "front-end/src/pages/worlds.vue"
};

async function exists(relativePath) {
	try {
		await access(path.join(repositoryRoot, relativePath), constants.F_OK);
		return true;
	}
	catch {
		return false;
	}
}

async function read(relativePath) {
	return readFile(path.join(repositoryRoot, relativePath), "utf8");
}

for (const removedPath of [
	".dockerignore",
	"Dockerfile",
	"docker-compose.yml",
	"compose.yaml",
	".github/workflows/qodana_code_quality.yml",
	".github/workflows/release-container.yml"
]) {
	assert.equal(await exists(removedPath), false, `${removedPath} must remain absent`);
}

const [
	artworkIndex,
	artworkPage,
	ci,
	contentHandoff,
	contentManifestText,
	environment,
	homePage,
	installPolicy,
	legacyRuntime,
	localeText,
	mainStyles,
	nginx,
	npmHelper,
	ownerStaticSecurity,
	prepare,
	promote,
	releaseMetadata,
	releaseWorkflow,
	runtimeServer,
	service,
	siteAdSlot,
	startupDiagnostics,
	storage,
	worldEntryCards,
	worldEntryPresentation,
	worldsData,
	worldsPage
] = await Promise.all([
	read(relativePaths.artworkIndex),
	read(relativePaths.artworkPage),
	read(relativePaths.ci),
	read(relativePaths.contentHandoff),
	read(relativePaths.contentManifest),
	read(relativePaths.environment),
	read(relativePaths.homePage),
	read(relativePaths.installPolicy),
	read(relativePaths.legacyRuntime),
	read(relativePaths.locale),
	read(relativePaths.mainStyles),
	read(relativePaths.nginx),
	read(relativePaths.npmHelper),
	read(relativePaths.ownerStaticSecurity),
	read(relativePaths.prepare),
	read(relativePaths.promote),
	read(relativePaths.releaseMetadata),
	read(relativePaths.releaseWorkflow),
	read(relativePaths.runtimeServer),
	read(relativePaths.service),
	read(relativePaths.siteAdSlot),
	read(relativePaths.startupDiagnostics),
	read(relativePaths.storage),
	read(relativePaths.worldEntryCards),
	read(relativePaths.worldEntryPresentation),
	read(relativePaths.worldsData),
	read(relativePaths.worldsPage)
]);

const contentManifest = JSON.parse(contentManifestText);
const locale = JSON.parse(localeText);
const expectedSanitizedHashes = new Map([
	[
		"content/tyler-handdrawn-v1/063-ba7430851cc35538.jpg",
		"67759447b4ee9270852543c702c988bc49f32dc02d9530e63940ce78df2e876f"
	],
	[
		"content/tyler-handdrawn-v1/084-fb97b37cd5c66f0e.jpg",
		"2e21081198704842a205cbd0b17e287506ff30103b94ae0fb8ef40195b1df2f4"
	],
	[
		"content/tyler-handdrawn-v1/010-171f13ce370c9716.jpg",
		"e01d1da026f3d7fb033ee9cb1d1e76cb4a29f312c9df6d3017645ab3d590c506"
	],
	[
		"content/tyler-handdrawn-v1/012-198b5c15c9c93a50.jpg",
		"2f32733e9b0a8909f6e40e4ffb876a44169978aa38f6dd9a7ef31d38d496438f"
	],
	[
		"content/tyler-handdrawn-v1/005-0905d798b55c8bb8.jpg",
		"b355da95d13779719502775ede3d6a8cf875037f3b9b41817f9f9ca9439c4a8a"
	]
]);

assert.match(contentManifest.hashSemantics.sourceSha256, /raw creative-source file/);
assert.match(contentManifest.hashSemantics.storedSanitizedSha256, /importer-sanitized bytes/);
assert.equal(contentManifest.expectedImportedMedia.liveOwnership.user, "tyler");
assert.equal(contentManifest.expectedImportedMedia.liveOwnership.group, "site_retrozetro");
assert.equal(contentManifest.expectedImportedMedia.liveOwnership.mode, "0600");
assert.equal(contentManifest.referencedMedia.length, expectedSanitizedHashes.size);
const artworkStorageKeys = [
	...artworkIndex.matchAll(/image: "\/uploads\/(content\/tyler-handdrawn-v1\/\d{3}-[a-f0-9]{16}\.jpg)"/g)
].map(match => match[1]);
const uniqueArtworkStorageKeys = new Set(artworkStorageKeys);
assert.equal(artworkStorageKeys.length, 85);
assert.equal(uniqueArtworkStorageKeys.size, 85);
assert.equal(contentManifest.artworkGallery.publicRoute, "/artwork");
assert.equal(contentManifest.artworkGallery.sourceIndex, relativePaths.artworkIndex);
assert.equal(contentManifest.artworkGallery.reviewedImageCount, 85);
assert.equal(contentManifest.artworkGallery.storageKeys.length, 85);
assert.deepEqual(contentManifest.artworkGallery.storageKeys, artworkStorageKeys);
for (const [index, storageKey] of artworkStorageKeys.entries()) {
	const expectedSequence = String(index + 1).padStart(3, "0");
	assert.match(storageKey, new RegExp(`/\\b${expectedSequence}-[a-f0-9]{16}\\.jpg$`));
}
assert.equal(contentManifest.siteContent["home-page"].showcaseItems, 7);
assert.equal(contentManifest.siteContent["home-page"].visualPresentation.surface, "dark-retroverse");
assert.equal(contentManifest.siteContent["home-page"].visualPresentation.oddFinalCard, "full-width-desktop");
assert.equal(contentManifest.siteContent["home-page"].visualPresentation.mobileColumns, 1);
assert.equal(contentManifest.siteContent["about-page"].storyArcs, 2);
assert.equal(contentManifest.siteContent["characters-page"].characters, 12);
assert.equal(contentManifest.siteContent["characters-page"].worldEntries, 9);
const expectedWorldEntryDisplayOrder = [
	"apex-army",
	"team-rimlaw-star-hunters",
	"zego-order",
	"bitgam",
	"galgri-and-galnoids",
	"council-of-orpex",
	"zlugnoid-hive-wars",
	"linkpods-and-cbots",
	"fz-and-oddverse"
];
const expectedFeaturedWorldEntries = ["apex-army", "bitgam", "zlugnoid-hive-wars"];
assert.deepEqual(
	contentManifest.siteContent["characters-page"].worldEntryPresentation.displayOrder,
	expectedWorldEntryDisplayOrder
);
assert.deepEqual(
	contentManifest.siteContent["characters-page"].worldEntryPresentation.featuredEntries,
	expectedFeaturedWorldEntries
);
const displayOrderSource = worldEntryPresentation.slice(
	worldEntryPresentation.indexOf("const worldEntryDisplayOrder")
);
let previousDisplayOrderIndex = -1;
for (const entryId of expectedWorldEntryDisplayOrder) {
	const currentDisplayOrderIndex = displayOrderSource.indexOf(`"${entryId}"`, previousDisplayOrderIndex + 1);
	assert.ok(currentDisplayOrderIndex > previousDisplayOrderIndex, `${entryId} is out of display order`);
	previousDisplayOrderIndex = currentDisplayOrderIndex;
}
for (const entryId of expectedFeaturedWorldEntries) {
	assert.match(worldEntryPresentation, new RegExp(`featuredWorldEntryIds = \\[.*"${entryId}"`));
}
assert.match(worldEntryCards, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(worldEntryCards, /grid-column: 1 \/ -1/);
assert.match(worldEntryCards, /@media \(max-width: 720px\)/);
assert.equal(contentManifest.siteContent["worlds-page"].worlds, 4);
assert.equal(contentManifest.siteContent["worlds-page"].conflicts, 3);
assert.equal(contentManifest.siteContent["worlds-page"].technologyEntries, 4);
assert.equal(contentManifest.siteContent["worlds-page"].visualPresentation.collectionSurface, "dark-retroverse");
assert.equal(contentManifest.siteContent["worlds-page"].visualPresentation.desktopColumns, 2);
assert.equal(contentManifest.siteContent["worlds-page"].visualPresentation.mobileColumns, 1);
assert.equal(contentManifest.siteContent["artwork-page"].reviewedImages, 85);
assert.equal(contentManifest.siteContent["artwork-page"].visualPresentation.gallerySurface, "dark-retroverse");
assert.equal(contentManifest.siteContent["artwork-page"].visualPresentation.paperToneUse, "artwork-frames-only");
assert.equal(contentManifest.visualPresentation.adPlaceholders, "commented-out-for-future-reinstatement");
const layout = await read("front-end/src/layouts/default.vue");
assert.equal([...layout.matchAll(/<!-- Parked (?:top|left|right) placement\.[\s\S]*?<SiteAdSlot[\s\S]*?-->/g)].length, 3);
assert.equal(contentManifest.siteContent["artwork-page"].initialHtmlImages, 85);
assert.equal(contentManifest.publicRoutes.length, 12);
assert.equal(contentManifest.visualPresentation.controlRadius, "8px");
const publicationBoundaries = contentManifest.publicationBoundaries.join("\n");
assert.match(publicationBoundaries, /remain distinct story arcs/);
assert.match(publicationBoundaries, /85 reviewed hand-drawn images/);
assert.match(publicationBoundaries, /seven excluded images/);
assert.doesNotMatch(publicationBoundaries, /labeled working story files/i);
assert.equal(locale.site.description, "Stories, characters, and worlds from the Retroverse.");
for (const media of contentManifest.referencedMedia) {
	assert.equal(expectedSanitizedHashes.has(media.storageKey), true, `Unexpected storage key: ${media.storageKey}`);
	assert.match(media.sourceSha256, /^[a-f0-9]{64}$/);
	assert.equal(media.storedSanitizedSha256, expectedSanitizedHashes.get(media.storageKey));
	assert.notEqual(media.sourceSha256, media.storedSanitizedSha256);
	assert.equal(uniqueArtworkStorageKeys.has(media.storageKey), true);
}

for (const publicContentSource of [artworkPage, worldEntryPresentation, worldsData, worldsPage]) {
	assert.doesNotMatch(
		publicContentSource,
		/working story|source notes|story files|world notes|final canon|open questions|still being developed/i
	);
}
assert.match(artworkPage, /\{\{ tylerArtworkItems\.length \}\} hand-drawn/);
assert.doesNotMatch(artworkPage, /Show more artwork/);
assert.match(artworkPage, /background-color: #09182a/);
assert.doesNotMatch(artworkPage, /background: rgba\(249, 234, 219/);
assert.match(homePage, /background-color: #0a1627/);
assert.match(homePage, /last-child:nth-child\(odd\)/);
assert.doesNotMatch(homePage, /background: rgba\(249, 234, 219/);
assert.match(mainStyles, /--radius-control: var\(--radius-field\)/);
assert.match(siteAdSlot, /rgba\(18, 11, 27, 0\.88\)/);
assert.match(worldsPage, /Planets and peoples/);
assert.match(worldsPage, /Wars and adventures/);
assert.match(worldsPage, /Machines and armor/);
assert.match(worldsPage, /worlds-section--atlas/);
assert.match(worldsPage, /background-color: #09182a/);
assert.doesNotMatch(worldsPage, /worlds-section--light/);

for (const requiredHandoffLanguage of [
	"verified transactional compatibility deployment",
	"pre-mutation artifact snapshot",
	"automatically restore",
	"storedSanitizedSha256",
	"service account: `tyler:tyler`",
	"tyler:site_retrozetro",
	"no S3 access or migration",
	"no media write or reimport",
	"no automatic `SiteContent` seed",
	"no publication action or state change",
	"exactly 85 unique storage",
	"The other 80 files have no checked-in sanitized-byte baseline",
	"all 85 public image URLs",
	"Investigation arc",
	"Rebellion arc",
	"Public defaults must",
	"SOURCE_DATE_EPOCH",
	"isolated automated editor and backend draft tests",
	"separate explicit authorization",
	"muted dark palette",
	"bright full-section paper background"
]) {
	assert.match(contentHandoff, new RegExp(requiredHandoffLanguage));
}
assert.match(contentHandoff, /Do not compare[\s\S]*sourceSha256/);
assert.match(contentHandoff, /Public defaults must\s+present the story directly/);
assert.match(contentHandoff, /ctime[\s\S]*site-perms[\s\S]*legitimately\s+refresh/);
assert.match(contentHandoff, /deployment\s+wall-clock time separately/);
assert.match(contentHandoff, /not a symlink-based atomic release/);
assert.doesNotMatch(contentHandoff, /established atomic compatibility-release procedure/);
assert.doesNotMatch(contentHandoff, /saves a private\s+draft without changing the public API/);
assert.doesNotMatch(contentHandoff, /Working story file|relationship remains for Tyler to confirm/);
assert.match(releaseWorkflow, /SOURCE_DATE_EPOCH/);
assert.match(releaseMetadata, /new Date\(sourceEpoch \* 1000\)\.toISOString\(\)/);

assert.doesNotMatch(`${ci}\n${releaseWorkflow}`, /\bdocker\b|\bghcr\.io\b/i);
assert.match(releaseWorkflow, /production deployment is not performed by this workflow/);
assert.match(ci, /verify:production-install/);
assert.match(ci, /verify:direct-runtime/);
assert.match(ci, /verify:install-scripts/);
assert.match(releaseWorkflow, /verify:install-scripts/);

for (const directive of [
	"User=retrozetro",
	"Group=retrozetro",
	"ProtectSystem=strict",
	"NoNewPrivileges=true",
	"RestrictNamespaces=true",
	"ReadWritePaths=/srv/retrozetro/shared/uploads"
]) {
	assert.match(service, new RegExp(`^${directive.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"));
}

assert.match(environment, /^HOST=127\.0\.0\.1$/m);
assert.match(environment, /^UPLOAD_ROOT=\/srv\/retrozetro\/shared\/uploads$/m);
assert.match(environment, /^TRUSTED_PROXY_IPS=127\.0\.0\.1,::1$/m);
assert.doesNotMatch(environment, /TRUST_PROXY_HOPS/);
assert.match(legacyRuntime, /LEGACY_BACKEND_ROOT = "\/srv\/retrozetrocomics\.com\/back-end"/);
assert.match(legacyRuntime, /LEGACY_STATIC_ROOT = "\/var\/www\/retrozetrocomics\.com"/);
assert.match(legacyRuntime, /const release = readStaticReleaseMetadata\(runtimeStaticRoot\)/);
assert.match(legacyRuntime, /source\.DEPLOYED_AT = release\.releasedAt/);
assert.match(legacyRuntime, /source\.RETROZETRO_RELEASE_VERSION = release\.version/);
assert.match(legacyRuntime, /source\.SOURCE_REVISION = release\.revision/);
assert.match(legacyRuntime, /delete source\.TRUST_PROXY_HOPS/);
assert.doesNotMatch(legacyRuntime, /configuredIdentityKeys/);
assert.match(runtimeServer, /await import\("dotenv\/config"\)/);
assert.match(runtimeServer, /applyLegacyDeploymentDefaults\(env\)/);
assert.match(runtimeServer, /describeRuntimeError\(error\)/);
assert.match(ci, /verify:startup-diagnostics/);
assert.match(releaseWorkflow, /verify:startup-diagnostics/);
assert.match(prepare, /verify:startup-diagnostics/);
assert.match(startupDiagnostics, /RuntimeConfigurationError/);
assert.match(startupDiagnostics, /assert\.doesNotMatch\(stderr, \/mongodb:/);
assert.match(storage, /resolvedApplicationRoot === LEGACY_BACKEND_ROOT/);
assert.match(storage, /resolvedRoot === path\.join\(LEGACY_BACKEND_ROOT, "uploads"\)/);

const rootPackage = JSON.parse(await read("package.json"));
const backEndPackage = JSON.parse(await read("back-end/package.json"));
const frontEndPackage = JSON.parse(await read("front-end/package.json"));
assert.equal(Object.hasOwn(rootPackage, "devEngines"), false);
assert.equal(Object.hasOwn(backEndPackage, "allowScripts"), false);
assert.equal(rootPackage.allowScripts?.["argon2@0.45.1"], true);
assert.equal(rootPackage.allowScripts?.["express-rate-limit@8.6.1"], false);
assert.match(frontEndPackage.scripts.build, /write-owner-static-security\.mjs/);
assert.match(ownerStaticSecurity, /Content-Security-Policy/);
assert.match(ownerStaticSecurity, /noindex,nofollow,noarchive,nosnippet/);
assert.match(ownerStaticSecurity, /assert\.doesNotMatch\(policy/);
assert.match(installPolicy, /npm ci|"ci"/);
assert.match(installPolicy, /--workspace/);
assert.match(npmHelper, /delete env\.npm_config_global_ignore_file/);
assert.match(npmHelper, /delete env\.NPM_CONFIG_GLOBAL_IGNORE_FILE/);

assert.match(nginx, /location = \/api\/internal\/dbinfo[\s\S]*?return 404;/);
assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:3006;/);
assert.match(nginx, /proxy_set_header X-Internal-Diagnostics-Key "";/);

assert.match(prepare, /Node 24\.18\.1 and npm 12\.0\.2/);
assert.match(prepare, /unset npm_config_global_ignore_file NPM_CONFIG_GLOBAL_IGNORE_FILE/);
assert.match(prepare, /verify:install-scripts/);
assert.match(prepare, /verify:production-install/);
assert.match(prepare, /npm audit --include=prod --omit=dev --include=optional/);
assert.match(promote, /--ipv4/);
assert.match(promote, /--ipv6/);
assert.match(promote, /probe_is_minimal_and_healthy/);
assert.match(promote, /dispatch_post_deploy_verification/);
assert.doesNotMatch(promote, /^identity_matches\(\)/m);
assert.match(promote, /Candidate verification failed; restoring the previous release/);
assert.match(promote, /api\/admin\/dashboard/);
assert.match(promote, /api\/internal\/dbinfo/);

for (const script of [relativePaths.install, relativePaths.prepare, relativePaths.promote]) {
	const absolutePath = path.join(repositoryRoot, script);
	const syntax = spawnSync("bash", ["-n", absolutePath], {
		encoding: "utf8"
	});
	assert.equal(syntax.status, 0, syntax.stderr || `${script} failed bash syntax validation`);
	if (process.platform !== "win32") {
		const metadata = await stat(absolutePath);
		assert.ok(metadata.mode & 0o100, `${script} must be executable by its owner`);
	}
}

console.log(JSON.stringify({
	directDeployment: "passed",
	dockerAssets: "absent",
	ipv4AndIpv6PromotionGates: "present",
	protectedDiagnostics: "present",
	scripts: "valid"
}));
