import { fileURLToPath } from "node:url";
import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

export default defineConfig({
	blockHosts: ["analytics.jacobdanderson.net", "analytics.retrozetrocomics.com", "pagead2.googlesyndication.com"],
	projectId: "d8k2m8",
	e2e: {
		baseUrl: "http://localhost:3333",
		chromeWebSecurity: false,
		specPattern: "cypress/e2e/**/*.spec.*",
		supportFile: "cypress/support/e2e.ts",
		setupNodeEvents(on) {
			on(
				"file:preprocessor",
				vitePreprocessor({
					configFile: false,
					resolve: {
						alias: {
							"@": fileURLToPath(new URL("./src", import.meta.url)),
							"~": fileURLToPath(new URL("./src", import.meta.url))
						}
					}
				})
			);
		}
	},
	component: {
		devServer: {
			framework: "vue",
			bundler: "vite"
		}
	}
});
