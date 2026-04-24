// vite.config.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";

import { unheadVueComposablesImports } from "@unhead/vue";
import Vue from "@vitejs/plugin-vue";

import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import VueMacros from "unplugin-vue-macros/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";
import Layouts from "vite-plugin-vue-layouts-next";
import generateSitemap from "vite-ssg-sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteHostname = "https://retrozetrocomics.com";
const sitemapExcludedRoutes = [
	"/posts",
	"/posts/:slug",
	"/studio/admin",
	"/:all(.*)"
];
// Dynamic post detail and catch-all routes should resolve through a generic
// static fallback like /index.html rather than placeholder prerender output.
const staticRenderExcludedRoutes = [
	"/posts",
	"/posts/:slug",
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
			dts: "src/typed-router.d.ts",
			watch: command === "serve" && !process.env.VITEST
		}),

		/* 2️⃣  VueMacros – this already injects @vitejs/plugin-vue */
		VueMacros({
			plugins: {
				vue: Vue({ include: [/\.vue$/] })
			}
		}),

		/* 3️⃣  Layouts */
		Layouts(),

		/* 4️⃣  Auto-import globals */
		AutoImport({
			include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/],
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
			include: [/\.vue$/, /\.vue\?vue/],
			dts: "src/components.d.ts"
		}),

		/* 6️⃣  CSS */
		Unocss(),

		/* 7️⃣  i18n */
		// https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
		VueI18n({
			runtimeOnly: true,
			compositionOnly: true,
			fullInstall: true,
			include: [path.resolve(__dirname, "locales/**")]
		})
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
