import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AdminOwnerWorkspace from "../src/components/admin/AdminOwnerWorkspace.vue";
import DefaultLayout from "../src/layouts/default.vue";
import { useSessionStore } from "../src/stores/session";

describe("owner workspace", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		const session = useSessionStore();
		session.account = {
			email: "owner@example.com",
			id: "owner",
			name: "Owner",
			role: "admin",
			status: "active"
		};
	});

	it("starts with plain task choices and keeps advanced tools available", async () => {
		const router = createRouter({
			history: createMemoryHistory(),
			routes: [{ component: { template: "<div />" }, path: "/studio/admin" }]
		});
		await router.push("/studio/admin");
		await router.isReady();

		const wrapper = mount(AdminOwnerWorkspace, {
			global: {
				plugins: [router],
				stubs: {
					AdminDashboard: true,
					AdminGuidedContentEditor: true,
					AdminHomeContentEditor: true,
					AdminMediaManager: true
				}
			}
		});

		expect(wrapper.get("h1").text()).toBe("What would you like to do?");
		expect(wrapper.text()).toContain("Add a picture or comic");
		expect(wrapper.text()).toContain("Edit the home page");
		expect(wrapper.text()).toContain("Add a character");
		expect(wrapper.text()).toContain("Add a story or chapter");
		expect(wrapper.text()).toContain("Edit something");
		expect(wrapper.text()).toContain("Preview as a visitor");
		expect(wrapper.text()).toContain("Advanced tools");
	});

	it("keeps the owner route focused when production adds a trailing slash", async () => {
		const pinia = createPinia();
		setActivePinia(pinia);
		const session = useSessionStore();
		vi.spyOn(session, "bootstrapSession").mockResolvedValue();
		const router = createRouter({
			history: createMemoryHistory(),
			routes: [
				{
					component: { template: '<div data-testid="owner-route">Owner route</div>' },
					path: "/studio/admin/"
				}
			]
		});
		await router.push("/studio/admin/");
		await router.isReady();

		const wrapper = mount(DefaultLayout, {
			global: {
				plugins: [pinia, router],
				stubs: {
					ResolvedImage: true,
					SiteAdSlot: true,
					TheFooter: true,
					TheHeader: true
				}
			}
		});

		expect(wrapper.find('[data-testid="owner-route"]').exists()).toBe(true);
		expect(wrapper.find(".site-shell").exists()).toBe(false);
	});
});
