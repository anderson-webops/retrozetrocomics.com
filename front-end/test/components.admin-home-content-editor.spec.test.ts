import type { HomePageContent } from "../src/types/site";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminHomeContentEditor from "../src/components/admin/AdminHomeContentEditor.vue";
import { createDefaultHomePageContent } from "../src/content/defaultHomePageContent";

const apiMocks = vi.hoisted(() => ({
	fetchAdminSiteContent: vi.fn(),
	fetchSiteContentRevisions: vi.fn(),
	publishAdminSiteContentDraft: vi.fn(),
	restoreSiteContentRevision: vi.fn(),
	saveAdminSiteContentDraft: vi.fn()
}));

vi.mock("../src/lib/siteApi", () => apiMocks);

function contentState(content: HomePageContent, hasDraft = false) {
	return {
		draft: content,
		draftUpdatedAt: null,
		hasDraft,
		lastPublishedAt: null,
		page: "home" as const,
		published: content,
		publishedVersion: 1
	};
}

describe("admin home content editor", () => {
	beforeEach(() => {
		window.localStorage.clear();
		vi.clearAllMocks();
		const content = createDefaultHomePageContent();
		apiMocks.fetchAdminSiteContent.mockResolvedValue(contentState(content));
		apiMocks.fetchSiteContentRevisions.mockResolvedValue([]);
		apiMocks.saveAdminSiteContentDraft.mockResolvedValue(contentState(content, true));
		apiMocks.publishAdminSiteContentDraft.mockResolvedValue(contentState(content));
	});

	it("loads the reviewed highlights and keeps publication behind confirmation", async () => {
		const wrapper = mount(AdminHomeContentEditor, {
			global: {
				stubs: {
					AdminConfirmDialog: {
						emits: ["cancel", "confirm"],
						props: ["open"],
						template:
							'<button v-if="open" data-confirm type="button" @click="$emit(\'confirm\')">Confirm</button>'
					},
					AdminMediaManager: true,
					ResolvedImage: {
						props: ["alt"],
						template: '<img :alt="alt" />'
					}
				}
			}
		});
		await flushPromises();

		expect(wrapper.text()).toContain("Choose what visitors see first");
		expect(wrapper.text()).toContain("The List");
		expect(wrapper.text()).toContain("The Fall of a Dream");
		expect(wrapper.text()).toContain("Exo Dexus");
		expect(wrapper.text()).toContain("Bitgam");

		const publishButton = wrapper.findAll("button").find(button => button.text() === "Publish this home page");
		expect(publishButton).toBeDefined();
		await publishButton?.trigger("click");
		expect(apiMocks.publishAdminSiteContentDraft).not.toHaveBeenCalled();

		await wrapper.get("[data-confirm]").trigger("click");
		await flushPromises();
		expect(apiMocks.saveAdminSiteContentDraft).toHaveBeenCalledOnce();
		expect(apiMocks.publishAdminSiteContentDraft).toHaveBeenCalledOnce();
	});
});
