// vite.config.ts
import path from "node:path";
import { defineConfig } from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite/dist/node/index.js";
import Vue from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import generateSitemap from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-ssg-sitemap/dist/index.js";
import Layouts from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import Components from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-vue-components/dist/vite.js";
import AutoImport from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-auto-import/dist/vite.js";
import Markdown from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-vue-markdown/dist/vite.js";
import VueMacros from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-vue-macros/dist/vite.mjs";
import VueI18n from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/@intlify/unplugin-vue-i18n/lib/vite.mjs";
import { VitePWA } from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-plugin-pwa/dist/index.js";
import VueDevTools from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import LinkAttributes from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/markdown-it-link-attributes/index.js";
import Unocss from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unocss/dist/vite.mjs";
import Shiki from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/@shikijs/markdown-it/dist/index.mjs";
import WebfontDownload from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-plugin-webfont-dl/dist/index.mjs";
import VueRouter from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-vue-router/dist/vite.js";
import { VueRouterAutoImports } from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/unplugin-vue-router/dist/index.js";
import Pages from "file:///Users/jacobanderson/Websites/retrozetrocomics.com/front-end/node_modules/vite-plugin-pages/dist/index.js";
var __vite_injected_original_dirname = "/Users/jacobanderson/Websites/retrozetrocomics.com/front-end";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "~/": `${path.resolve(__vite_injected_original_dirname, "src")}/`
    }
  },
  plugins: [
    VueMacros({
      plugins: {
        vue: Vue({
          include: [/\.vue$/, /\.md$/]
        })
      }
    }),
    // https://github.com/posva/unplugin-vue-router
    VueRouter({
      extensions: [".vue", ".md"],
      dts: "src/typed-router.d.ts"
    }),
    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts(),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: [
        "vue",
        "vue-i18n",
        "@vueuse/head",
        "@vueuse/core",
        VueRouterAutoImports,
        {
          // add any other imports you were relying on
          "vue-router/auto": ["useLink"]
        }
      ],
      dts: "src/auto-imports.d.ts",
      dirs: [
        "src/composables",
        "src/stores"
      ],
      vueTemplate: true
    }),
    // https://github.com/antfu/unplugin-vue-components
    Components({
      // allow auto load markdown components under `./src/components/`
      extensions: ["vue", "md"],
      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      dts: "src/components.d.ts"
    }),
    // https://github.com/antfu/unocss
    // see uno.config.ts for config
    Unocss(),
    // https://github.com/unplugin/unplugin-vue-markdown
    // Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
    Markdown({
      wrapperClasses: "prose prose-sm m-auto text-left",
      headEnabled: true,
      async markdownItSetup(md) {
        md.use(LinkAttributes, {
          matcher: (link) => /^https?:\/\//.test(link),
          attrs: {
            target: "_blank",
            rel: "noopener"
          }
        });
        md.use(await Shiki({
          defaultColor: false,
          themes: {
            light: "vitesse-light",
            dark: "vitesse-dark"
          }
        }));
      }
    }),
    Pages({
      // Plugin options
    }),
    // https://github.com/antfu/vite-plugin-pwa
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "safari-pinned-tab.svg"],
      manifest: {
        name: "Vitesse",
        short_name: "Vitesse",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    }),
    // https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      fullInstall: true,
      include: [path.resolve(__vite_injected_original_dirname, "locales/**")]
    }),
    // https://github.com/feat-agency/vite-plugin-webfont-dl
    WebfontDownload(),
    // https://github.com/webfansplz/vite-plugin-vue-devtools
    VueDevTools()
  ],
  // https://github.com/vitest-dev/vitest
  test: {
    include: ["test/**/*.test.ts"],
    environment: "jsdom"
  },
  // https://github.com/antfu/vite-ssg
  ssgOptions: {
    script: "async",
    formatting: "minify",
    crittersOptions: {
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
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFjb2JhbmRlcnNvbi9XZWJzaXRlcy9yZXRyb3pldHJvY29taWNzLmNvbS9mcm9udC1lbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9qYWNvYmFuZGVyc29uL1dlYnNpdGVzL3JldHJvemV0cm9jb21pY3MuY29tL2Zyb250LWVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvamFjb2JhbmRlcnNvbi9XZWJzaXRlcy9yZXRyb3pldHJvY29taWNzLmNvbS9mcm9udC1lbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcGF0aCBmcm9tIFwibm9kZTpwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IFZ1ZSBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI7XG5pbXBvcnQgZ2VuZXJhdGVTaXRlbWFwIGZyb20gXCJ2aXRlLXNzZy1zaXRlbWFwXCI7XG5pbXBvcnQgTGF5b3V0cyBmcm9tIFwidml0ZS1wbHVnaW4tdnVlLWxheW91dHNcIjtcbmltcG9ydCBDb21wb25lbnRzIGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy92aXRlXCI7XG5pbXBvcnQgQXV0b0ltcG9ydCBmcm9tIFwidW5wbHVnaW4tYXV0by1pbXBvcnQvdml0ZVwiO1xuaW1wb3J0IE1hcmtkb3duIGZyb20gXCJ1bnBsdWdpbi12dWUtbWFya2Rvd24vdml0ZVwiO1xuaW1wb3J0IFZ1ZU1hY3JvcyBmcm9tIFwidW5wbHVnaW4tdnVlLW1hY3Jvcy92aXRlXCI7XG5pbXBvcnQgVnVlSTE4biBmcm9tIFwiQGludGxpZnkvdW5wbHVnaW4tdnVlLWkxOG4vdml0ZVwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcbmltcG9ydCBWdWVEZXZUb29scyBmcm9tIFwidml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXCI7XG5pbXBvcnQgTGlua0F0dHJpYnV0ZXMgZnJvbSBcIm1hcmtkb3duLWl0LWxpbmstYXR0cmlidXRlc1wiO1xuaW1wb3J0IFVub2NzcyBmcm9tIFwidW5vY3NzL3ZpdGVcIjtcbmltcG9ydCBTaGlraSBmcm9tIFwiQHNoaWtpanMvbWFya2Rvd24taXRcIjtcbmltcG9ydCBXZWJmb250RG93bmxvYWQgZnJvbSBcInZpdGUtcGx1Z2luLXdlYmZvbnQtZGxcIjtcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSBcInVucGx1Z2luLXZ1ZS1yb3V0ZXIvdml0ZVwiO1xuaW1wb3J0IHsgVnVlUm91dGVyQXV0b0ltcG9ydHMgfSBmcm9tIFwidW5wbHVnaW4tdnVlLXJvdXRlclwiO1xuaW1wb3J0IFBhZ2VzIGZyb20gXCJ2aXRlLXBsdWdpbi1wYWdlc1wiO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG5cdHJlc29sdmU6IHtcblx0XHRhbGlhczoge1xuXHRcdFx0XCJ+L1wiOiBgJHtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcInNyY1wiKX0vYCxcblx0XHR9LFxuXHR9LFxuXHRcblx0cGx1Z2luczogW1xuXHRcdFZ1ZU1hY3Jvcyh7XG5cdFx0XHRwbHVnaW5zOiB7XG5cdFx0XHRcdHZ1ZTogVnVlKHtcblx0XHRcdFx0XHRpbmNsdWRlOiBbL1xcLnZ1ZSQvLCAvXFwubWQkL10sXG5cdFx0XHRcdH0pLFxuXHRcdFx0fSxcblx0XHR9KSxcblx0XHRcblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vcG9zdmEvdW5wbHVnaW4tdnVlLXJvdXRlclxuXHRcdFZ1ZVJvdXRlcih7XG5cdFx0XHRleHRlbnNpb25zOiBbXCIudnVlXCIsIFwiLm1kXCJdLFxuXHRcdFx0ZHRzOiBcInNyYy90eXBlZC1yb3V0ZXIuZC50c1wiLFxuXHRcdH0pLFxuXHRcdFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9Kb2huQ2FtcGlvbkpyL3ZpdGUtcGx1Z2luLXZ1ZS1sYXlvdXRzXG5cdFx0TGF5b3V0cygpLFxuXHRcdFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1hdXRvLWltcG9ydFxuXHRcdEF1dG9JbXBvcnQoe1xuXHRcdFx0aW1wb3J0czogW1xuXHRcdFx0XHRcInZ1ZVwiLFxuXHRcdFx0XHRcInZ1ZS1pMThuXCIsXG5cdFx0XHRcdFwiQHZ1ZXVzZS9oZWFkXCIsXG5cdFx0XHRcdFwiQHZ1ZXVzZS9jb3JlXCIsXG5cdFx0XHRcdFZ1ZVJvdXRlckF1dG9JbXBvcnRzLFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gYWRkIGFueSBvdGhlciBpbXBvcnRzIHlvdSB3ZXJlIHJlbHlpbmcgb25cblx0XHRcdFx0XHRcInZ1ZS1yb3V0ZXIvYXV0b1wiOiBbXCJ1c2VMaW5rXCJdLFxuXHRcdFx0XHR9LFxuXHRcdFx0XSxcblx0XHRcdGR0czogXCJzcmMvYXV0by1pbXBvcnRzLmQudHNcIixcblx0XHRcdGRpcnM6IFtcblx0XHRcdFx0XCJzcmMvY29tcG9zYWJsZXNcIixcblx0XHRcdFx0XCJzcmMvc3RvcmVzXCIsXG5cdFx0XHRdLFxuXHRcdFx0dnVlVGVtcGxhdGU6IHRydWUsXG5cdFx0fSksXG5cdFx0XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzXG5cdFx0Q29tcG9uZW50cyh7XG5cdFx0XHQvLyBhbGxvdyBhdXRvIGxvYWQgbWFya2Rvd24gY29tcG9uZW50cyB1bmRlciBgLi9zcmMvY29tcG9uZW50cy9gXG5cdFx0XHRleHRlbnNpb25zOiBbXCJ2dWVcIiwgXCJtZFwiXSxcblx0XHRcdC8vIGFsbG93IGF1dG8gaW1wb3J0IGFuZCByZWdpc3RlciBjb21wb25lbnRzIHVzZWQgaW4gbWFya2Rvd25cblx0XHRcdGluY2x1ZGU6IFsvXFwudnVlJC8sIC9cXC52dWVcXD92dWUvLCAvXFwubWQkL10sXG5cdFx0XHRkdHM6IFwic3JjL2NvbXBvbmVudHMuZC50c1wiLFxuXHRcdH0pLFxuXHRcdFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bm9jc3Ncblx0XHQvLyBzZWUgdW5vLmNvbmZpZy50cyBmb3IgY29uZmlnXG5cdFx0VW5vY3NzKCksXG5cdFx0XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3VucGx1Z2luL3VucGx1Z2luLXZ1ZS1tYXJrZG93blxuXHRcdC8vIERvbid0IG5lZWQgdGhpcz8gVHJ5IHZpdGVzc2UtbGl0ZTogaHR0cHM6Ly9naXRodWIuY29tL2FudGZ1L3ZpdGVzc2UtbGl0ZVxuXHRcdE1hcmtkb3duKHtcblx0XHRcdHdyYXBwZXJDbGFzc2VzOiBcInByb3NlIHByb3NlLXNtIG0tYXV0byB0ZXh0LWxlZnRcIixcblx0XHRcdGhlYWRFbmFibGVkOiB0cnVlLFxuXHRcdFx0YXN5bmMgbWFya2Rvd25JdFNldHVwKG1kKSB7XG5cdFx0XHRcdG1kLnVzZShMaW5rQXR0cmlidXRlcywge1xuXHRcdFx0XHRcdG1hdGNoZXI6IChsaW5rOiBzdHJpbmcpID0+IC9eaHR0cHM/OlxcL1xcLy8udGVzdChsaW5rKSxcblx0XHRcdFx0XHRhdHRyczoge1xuXHRcdFx0XHRcdFx0dGFyZ2V0OiBcIl9ibGFua1wiLFxuXHRcdFx0XHRcdFx0cmVsOiBcIm5vb3BlbmVyXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSk7XG5cdFx0XHRcdG1kLnVzZShhd2FpdCBTaGlraSh7XG5cdFx0XHRcdFx0ZGVmYXVsdENvbG9yOiBmYWxzZSxcblx0XHRcdFx0XHR0aGVtZXM6IHtcblx0XHRcdFx0XHRcdGxpZ2h0OiBcInZpdGVzc2UtbGlnaHRcIixcblx0XHRcdFx0XHRcdGRhcms6IFwidml0ZXNzZS1kYXJrXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0fSkpO1xuXHRcdFx0fSxcblx0XHR9KSxcblx0XHRcblx0XHRQYWdlcyh7XG5cdFx0XHQvLyBQbHVnaW4gb3B0aW9uc1xuXHRcdH0pLFxuXHRcdFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXBsdWdpbi1wd2Fcblx0XHRWaXRlUFdBKHtcblx0XHRcdHJlZ2lzdGVyVHlwZTogXCJhdXRvVXBkYXRlXCIsXG5cdFx0XHRpbmNsdWRlQXNzZXRzOiBbXCJmYXZpY29uLnN2Z1wiLCBcInNhZmFyaS1waW5uZWQtdGFiLnN2Z1wiXSxcblx0XHRcdG1hbmlmZXN0OiB7XG5cdFx0XHRcdG5hbWU6IFwiVml0ZXNzZVwiLFxuXHRcdFx0XHRzaG9ydF9uYW1lOiBcIlZpdGVzc2VcIixcblx0XHRcdFx0dGhlbWVfY29sb3I6IFwiI2ZmZmZmZlwiLFxuXHRcdFx0XHRpY29uczogW1xuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHNyYzogXCIvcHdhLTE5MngxOTIucG5nXCIsXG5cdFx0XHRcdFx0XHRzaXplczogXCIxOTJ4MTkyXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBcImltYWdlL3BuZ1wiLFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0c3JjOiBcIi9wd2EtNTEyeDUxMi5wbmdcIixcblx0XHRcdFx0XHRcdHNpemVzOiBcIjUxMng1MTJcIixcblx0XHRcdFx0XHRcdHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRzcmM6IFwiL3B3YS01MTJ4NTEyLnBuZ1wiLFxuXHRcdFx0XHRcdFx0c2l6ZXM6IFwiNTEyeDUxMlwiLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJpbWFnZS9wbmdcIixcblx0XHRcdFx0XHRcdHB1cnBvc2U6IFwiYW55IG1hc2thYmxlXCIsXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XSxcblx0XHRcdH0sXG5cdFx0fSksXG5cdFx0XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2ludGxpZnkvYnVuZGxlLXRvb2xzL3RyZWUvbWFpbi9wYWNrYWdlcy91bnBsdWdpbi12dWUtaTE4blxuXHRcdFZ1ZUkxOG4oe1xuXHRcdFx0cnVudGltZU9ubHk6IHRydWUsXG5cdFx0XHRjb21wb3NpdGlvbk9ubHk6IHRydWUsXG5cdFx0XHRmdWxsSW5zdGFsbDogdHJ1ZSxcblx0XHRcdGluY2x1ZGU6IFtwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcImxvY2FsZXMvKipcIildLFxuXHRcdH0pLFxuXHRcdFxuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZWF0LWFnZW5jeS92aXRlLXBsdWdpbi13ZWJmb250LWRsXG5cdFx0V2ViZm9udERvd25sb2FkKCksXG5cdFx0XG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL3dlYmZhbnNwbHovdml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXG5cdFx0VnVlRGV2VG9vbHMoKSxcblx0XSxcblx0XG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92aXRlc3QtZGV2L3ZpdGVzdFxuXHR0ZXN0OiB7XG5cdFx0aW5jbHVkZTogW1widGVzdC8qKi8qLnRlc3QudHNcIl0sXG5cdFx0ZW52aXJvbm1lbnQ6IFwianNkb21cIixcblx0fSxcblx0XG5cdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS92aXRlLXNzZ1xuXHRzc2dPcHRpb25zOiB7XG5cdFx0c2NyaXB0OiBcImFzeW5jXCIsXG5cdFx0Zm9ybWF0dGluZzogXCJtaW5pZnlcIixcblx0XHRjcml0dGVyc09wdGlvbnM6IHtcblx0XHRcdHJlZHVjZUlubGluZVN0eWxlczogZmFsc2UsXG5cdFx0fSxcblx0XHRvbkZpbmlzaGVkKCkge1xuXHRcdFx0Z2VuZXJhdGVTaXRlbWFwKCk7XG5cdFx0fSxcblx0fSxcblx0XG5cdHNzcjoge1xuXHRcdC8vIFRPRE86IHdvcmthcm91bmQgdW50aWwgdGhleSBzdXBwb3J0IG5hdGl2ZSBFU01cblx0XHRub0V4dGVybmFsOiBbXCJ3b3JrYm94LXdpbmRvd1wiLCAvdnVlLWkxOG4vXSxcblx0fSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzVyxP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
