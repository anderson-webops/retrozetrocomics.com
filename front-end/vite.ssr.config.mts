import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.mts";

export default defineConfig(context =>
	mergeConfig(baseConfig(context), {
		build: {
			ssr: "src/entry-server.ts",
			outDir: "../back-end/dist/public-renderer",
			emptyOutDir: true,
			cssCodeSplit: false,
			rollupOptions: { output: { entryFileNames: "entry-server.mjs", chunkFileNames: "[name]-[hash].mjs" } }
		},
		ssr: { noExternal: true }
	})
);
