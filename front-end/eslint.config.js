import ppFlat from "eslint-config-prettier/flat";
import prettier from "eslint-plugin-prettier";
import vuePlugin from "eslint-plugin-vue";
import globals from "globals";
import ts from "typescript-eslint";
import vueParser from "vue-eslint-parser";
// front-end/eslint.config.js
import base from "../eslint.config.js"; // shared root config
import auto from "./.eslintrc-auto-import.json" with { type: "json" };

export default base
	/* project-specific additions */
	.append({
		languageOptions: { globals: { ...globals.browser, ...auto.globals } },
		plugins: { prettier },
		rules: {
			"prettier/prettier": "error",
			"vue/multi-word-component-names": "off",
			"ts/no-explicit-any": "off",
			"no-undef": "off" // auto-imported globals
		}
	})

	/* overrides ---------------------------------------------------- */
	.append(
		// TypeScript
		{
			files: ["**/*.ts"],
			languageOptions: {
				parser: ts.parser,
				parserOptions: { project: "./tsconfig.json" },
				globals: { ...globals.node, ...auto.globals }
			}
		},

		// Vue SFCs
		{
			files: ["**/*.vue"],
			plugins: { vue: vuePlugin },
			languageOptions: {
				parser: vueParser,
				parserOptions: {
					parser: ts.parser,
					extraFileExtensions: [".vue"]
				}
			},
			rules: { "vue/no-unused-vars": "off" }
		},

		// build / config scripts
		{
			files: ["**/*.{js,cjs,mjs}", "*.config.js", "vite.config.{js,ts}"],
			languageOptions: { sourceType: "module" }
		}
	)

	/* keep Prettier conflict-killer last */
	.append(ppFlat);
