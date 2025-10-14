// vite.config.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import VueI18n from "@intlify/unplugin-vue-i18n/vite";

import Shiki from "@shikijs/markdown-it";
import { unheadVueComposablesImports } from "@unhead/vue";
import Vue from "@vitejs/plugin-vue";

import LinkAttributes from "markdown-it-link-attributes";
import Unocss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import VueMacros from "unplugin-vue-macros/vite";
import Markdown from "unplugin-vue-markdown/vite";
import { VueRouterAutoImports } from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import VueDevTools from "vite-plugin-vue-devtools";
import Layouts from "vite-plugin-vue-layouts-next";
import generateSitemap from "vite-ssg-sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"~": `${path.resolve(__dirname, "src")}/`,
			"@": `${path.resolve(__dirname, "src")}/`
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
				md.use(
					await Shiki({
						defaultColor: false,
						themes: { light: "vitesse-light", dark: "vitesse-dark" }
					})
				);
			}
		}),

		/* 7️⃣  PWA */
		VitePWA({
			registerType: "autoUpdate",
			includeAssets: [
				"favicon.ico",
				"favicon-16x16.png",
				"favicon-32x32.png",
				"apple-touch-icon.png",
				"android-chrome-192x192.png",
				"android-chrome-512x512.png"
			],
			manifest: {
				name: "Classes",
				short_name: "Classes",
				theme_color: "#ffffff",
				background_color: "#ffffff",
				display: "standalone",
				icons: [
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/android-chrome-192x192.png",
						sizes: "192x192",
						type: "image/png"
					},
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/android-chrome-512x512.png",
						sizes: "512x512",
						type: "image/png"
					},
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/apple-touch-icon.png",
						sizes: "180x180",
						type: "image/png",
						purpose: "apple-touch-icon"
					},
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/favicon-32x32.png",
						sizes: "32x32",
						type: "image/png"
					},
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/favicon-16x16.png",
						sizes: "16x16",
						type: "image/png"
					},
					{
						src: "https://retrozetrocomics.s3.us-east-1.amazonaws.com/Favicons/favicon.ico",
						sizes: "48x48",
						type: "image/x-icon"
					}
				]
			},
			workbox: {
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
	},

	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3006",
				changeOrigin: true,
				rewrite: p => p.replace(/^\/api/, "") // strip /api
			}
		}
	}
});
