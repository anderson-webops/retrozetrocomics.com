// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import { createDefaultAboutPageContent } from "../../src/content/defaultAboutPageContent";

import { createDefaultCharactersPageContent } from "../../src/content/defaultCharactersPageContent";
// Import commands.js using ES2015 syntax:
import "./commands";

beforeEach(() => {
	cy.intercept("GET", "/api/auth/me", {
		body: {
			account: null,
			authenticated: false
		},
		statusCode: 200
	});
	cy.intercept("GET", "/api/site-content/about", {
		body: { content: createDefaultAboutPageContent() },
		statusCode: 200
	});
	cy.intercept("GET", "/api/site-content/characters", {
		body: { content: createDefaultCharactersPageContent() },
		statusCode: 200
	});
});
