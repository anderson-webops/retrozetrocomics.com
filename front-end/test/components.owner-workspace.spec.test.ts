import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";

import AdminOwnerWorkspace from "../src/components/admin/AdminOwnerWorkspace.vue";
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
					AdminMediaManager: true
				}
			}
		});

		expect(wrapper.get("h1").text()).toBe("What would you like to do?");
		expect(wrapper.text()).toContain("Add a picture or comic");
		expect(wrapper.text()).toContain("Add a character");
		expect(wrapper.text()).toContain("Add a story idea");
		expect(wrapper.text()).toContain("Edit something");
		expect(wrapper.text()).toContain("Preview as a visitor");
		expect(wrapper.text()).toContain("Advanced tools");
	});
});
