import { defineConfig } from "cypress";

export default defineConfig({
	allowCypressEnv: false,
	blockHosts: ["analytics.jacobdanderson.net", "analytics.retrozetrocomics.com", "pagead2.googlesyndication.com"],
	projectId: "d8k2m8",
	e2e: {
		baseUrl: "http://localhost:3333",
		chromeWebSecurity: false,
		specPattern: "cypress/e2e/**/*.spec.*",
		supportFile: "cypress/support/e2e.ts"
	},
	component: {
		devServer: {
			framework: "vue",
			bundler: "vite"
		}
	}
});
