import path, { resolve } from "node:path";
import { defineConfig } from "vite";

import VueMacros from "unplugin-vue-macros/vite";
import VueRouter from "unplugin-vue-router/vite";
import Layouts from "vite-plugin-vue-layouts-next";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import Unocss from "unocss/vite";
import Markdown from "unplugin-vue-markdown/vite";
import Shiki from "@shikijs/markdown-it";
import LinkAttributes from "markdown-it-link-attributes";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";
import { unheadVueComposablesImports } from "@unhead/vue";
import Vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import VueDevTools from "vite-plugin-vue-devtools";
import generateSitemap from "vite-ssg-sitemap";
import { VueRouterAutoImports } from "unplugin-vue-router";

export default defineConfig({
	resolve: {
		alias: {
			"~": `${resolve(__dirname, "src")}/`,
			"@": `${resolve(__dirname, "src")}/`
		}
	},
	
	plugins: [
		/* 1️⃣  Router (must run before macros/layouts) */
		VueRouter({
			extensions: [".vue", ".md"],
			dts: "src/typed-router.d.ts"
		}),
		
		/* 2️⃣  VueMacros – this already injects @vitejs/plugin-vue */
		VueMacros({
			plugins: {
				vue: Vue({ include: [/\.vue$/, /\.md$/] })
			}
		}),
		
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
				unheadVueComposablesImports,   // supplies useHead / useSeoMeta
				VueRouterAutoImports,
				{ "vue-router/auto": ["useLink"] }
			],
			eslintrc: {
				enabled: true,
				filepath: ".eslintrc-auto-import.json",
				globalsPropValue: true, // all the auto-imports become readonly globals
			},
			dts: "src/auto-imports.d.ts",
			dirs: ["src/composables", "src/stores"],
			vueTemplate: true
		}),
		
		/* 5️⃣  Auto-register components */
		Components({
			extensions: ["vue", "md"],
			include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
			dts: "src/components.d.ts"
		}),
		
		/* 6️⃣  CSS / Markdown / Misc */
		Unocss(),
		Markdown({
			wrapperClasses: "prose prose-sm m-auto text-left",
			headEnabled: true,
			async markdownItSetup(md) {
				md.use(LinkAttributes, {
					matcher: (link: string) => /^https?:\/\//.test(link),
					attrs: { target: "_blank", rel: "noopener" }
				});
				md.use(await Shiki({
					defaultColor: false,
					themes: { light: "vitesse-light", dark: "vitesse-dark" }
				}));
			}
		}),
		
		/* 7️⃣  PWA */
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: ["favicon.svg", "safari-pinned-tab.svg"],
			manifest: {
				name: "Vitesse",
				short_name: "Vitesse",
				theme_color: "#ffffff",
				icons: [
					{ src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
					{ src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
					{ src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" }
				]
			},
			workbox: {             // optional: silence the glob warning
				globPatterns: ["**/*.{js,css,html,png,svg,ico}"]
			}
		}),
		
		/* 8️⃣  i18n, fonts, devtools */
		// https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
		VueI18n({
			runtimeOnly: true,
			compositionOnly: true,
			fullInstall: true,
			include: [path.resolve(__dirname, "locales/**")]
		}),
		
		// https://github.com/webfansplz/vite-plugin-vue-devtools
		VueDevTools()
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
		formatting: "minify",
		beastiesOptions: {
			reduceInlineStyles: false
		},
		onFinished() {
			generateSitemap();
		}
	},
	
	ssr: {
		// TODO: workaround until they support native ESM
		noExternal: ["workbox-window", /vue-i18n/]
	}
});
