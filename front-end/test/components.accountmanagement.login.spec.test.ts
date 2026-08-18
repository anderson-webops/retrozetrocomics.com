// components/accountmanagement.login.spec.test.ts
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as apiMod from "../src/api";
import AccountManagement from "../src/components/AccountManagement.vue";
import { useSessionStore } from "../src/stores/session";

// Mock the axios client we export from "@/api"
vi.mock("@/api", () => {
	const mock = {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
		defaults: { baseURL: "/api", withCredentials: true }
	};
	return { api: mock };
});

describe("accountManagement.vue login (happy path)", () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	it("accepts the owner password and moves to passkey enrollment", async () => {
		const session = useSessionStore();
		session.openAuth();

		(apiMod.api.post as any).mockResolvedValueOnce({
			data: {
				account: null,
				authenticated: false,
				mfa: { mode: "enroll", required: true }
			}
		});

		const wrapper = mount(AccountManagement, {
			global: {
				stubs: {
					teleport: true
				}
			}
		});

		await wrapper.get('input[type="email"]').setValue("user@example.com");
		await wrapper.get('input[type="password"]').setValue("secret123");
		await wrapper.get("form").trigger("submit.prevent");

		expect(apiMod.api.post).toHaveBeenCalledWith("/auth/login", {
			email: "user@example.com",
			password: "secret123"
		});

		expect(session.account).toBeNull();
		expect(session.authModalOpen).toBe(true);
		expect(session.authStep).toBe("enroll");
		expect(wrapper.text()).toContain("Set up my passkey");
	});
});
