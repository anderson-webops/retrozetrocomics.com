// vite.config.ts
import path from "node:path";
import { fileURLToPath } from "node:url";

import { unheadVueComposablesImports } from "@unhead/vue";
import Vue from "@vitejs/plugin-vue";

import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";
import generateSitemap from "vite-ssg-sitemap";
import { VueRouterAutoImports } from "vue-router/unplugin";
import VueRouter from "vue-router/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteHostname = "https://retrozetrocomics.com";
const sitemapExcludedRoutes = [
	"/studio/admin",
	"/:all(.*)"
];
const staticRenderExcludedRoutes = [
	"/studio",
	"/:all(.*)"
];

export default defineConfig(({ command }) => ({
	resolve: {
		alias: {
			"~": `${path.resolve(__dirname, "src")}/`,
			"@": `${path.resolve(__dirname, "src")}/`
		}
	},

	plugins: [
		/* 1️⃣  Router (must run before macros/layouts) */
		VueRouter({
			extensions: [".vue"],
			dts: "src/route-map.d.ts",
			watch: command === "serve" && !process.env.VITEST
		}),

		/* 2️⃣  Vue */
		Vue(),

		/* 3️⃣  Layouts */
		Layouts(),

		/* 4️⃣  Auto-import globals */
		AutoImport({
			include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/, /\.md$/],
			// ⚠️ remove @vueuse/head to avoid duplicate helpers
			imports: [
				"vue",
				"vue-i18n",
				"@vueuse/core",
				unheadVueComposablesImports, // supplies useHead / useSeoMeta
				VueRouterAutoImports,
				{ "vue-router/auto": ["useLink"] }
			],
			eslintrc: {
				enabled: true,
				filepath: ".eslintrc-auto-import.json",
				globalsPropValue: true // all the auto-imports become readonly globals
			},
			dts: "src/auto-imports.d.ts",
			dirs: ["src/composables", "src/stores"],
			vueTemplate: true
		}),

		/* 5️⃣  Auto-register components */
		Components({
			extensions: ["vue"],
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			dts: "src/components.d.ts"
		}),

		/* 6️⃣  CSS / Markdown / Misc */
		Unocss(),
	],

	/* vitest */
	// https://github.com/vitest-dev/vitest
	test: {
		include: ["test/**/*.test.ts"],
		environment: "jsdom"
	},

	/* vite-ssg */
	// https://github.com/antfu/vite-ssg
	ssgOptions: {
		script: "async",
		dirStyle: "nested",
		formatting: "minify",
		beastiesOptions: {
			reduceInlineStyles: false
		},
		includedRoutes(paths) {
			return paths.filter(
				path => !staticRenderExcludedRoutes.includes(path)
			);
		},
		onFinished() {
			generateSitemap({
				exclude: sitemapExcludedRoutes,
				hostname: siteHostname,
				readable: true,
				robots: [
					{
						allow: "/",
						disallow: ["/studio/admin"],
						userAgent: "*"
					}
				]
			});
		}
	},

	ssr: {
		// TODO: workaround until they support native ESM
		noExternal: [/vue-i18n/]
	},

	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3006",
				changeOrigin: true
			},
			"/uploads": {
				target: "http://localhost:3006",
				changeOrigin: true
			}
		}
	}
}));

