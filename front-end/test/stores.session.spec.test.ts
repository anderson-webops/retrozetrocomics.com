import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import * as apiMod from "../src/api";
import { useSessionStore } from "../src/stores/session";

vi.mock("@/api", () => {
	const mock = {
		get: vi.fn(),
		post: vi.fn()
	};
	return { api: mock };
});

function installLocalStorageStub() {
	const values = new Map<string, string>();
	Object.defineProperty(window, "localStorage", {
		configurable: true,
		value: {
			clear: vi.fn(() => values.clear()),
			getItem: vi.fn((key: string) => values.get(key) ?? null),
			removeItem: vi.fn((key: string) => values.delete(key)),
			setItem: vi.fn((key: string, value: string) => {
				values.set(key, value);
			})
		}
	});
}

describe("session store", () => {
	beforeEach(() => {
		installLocalStorageStub();
		setActivePinia(createPinia());
		vi.clearAllMocks();
	});

	it("hydrates an admin session", async () => {
		(apiMod.api.get as any).mockResolvedValueOnce({
			data: {
				account: {
					email: "owner@example.com",
					id: "admin-1",
					name: "Owner",
					role: "admin",
					status: "active"
				},
				authenticated: true
			}
		});

		const session = useSessionStore();
		await session.bootstrapSession();

		expect(apiMod.api.get).toHaveBeenCalledWith("/auth/me");
		expect(session.account?.id).toBe("admin-1");
		expect(session.isAdmin).toBe(true);
		expect(session.showAdminTools).toBe(true);
	});

	it("signs in through the admin auth endpoint", async () => {
		(apiMod.api.post as any).mockResolvedValueOnce({
			data: {
				account: {
					email: "owner@example.com",
					id: "admin-1",
					name: "Owner",
					role: "admin",
					status: "active"
				}
			}
		});

		const session = useSessionStore();
		session.openAuth();
		await session.login({
			email: "owner@example.com",
			password: "password123"
		});

		expect(apiMod.api.post).toHaveBeenCalledWith("/auth/login", {
			email: "owner@example.com",
			password: "password123"
		});
		expect(session.authModalOpen).toBe(false);
		expect(session.account?.role).toBe("admin");
	});

	it("clears local account state on sign out", async () => {
		(apiMod.api.post as any).mockResolvedValueOnce({ data: {} });

		const session = useSessionStore();
		session.account = {
			email: "owner@example.com",
			id: "admin-1",
			name: "Owner",
			role: "admin",
			status: "active"
		};

		await session.logout();

		expect(apiMod.api.post).toHaveBeenCalledWith("/auth/logout");
		expect(session.account).toBeNull();
	});
});
