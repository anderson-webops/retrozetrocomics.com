import type { CaptchaChallenge, SiteAccount } from "@/types/site";

import { defineStore } from "pinia";

import { api } from "@/api";

type AuthMode = "login" | "signup";
const ADMIN_VIEWER_MODE_KEY = "retrozetro:admin-viewer-mode";

export const useSessionStore = defineStore("session", {
	state: () => ({
		account: null as SiteAccount | null,
		adminViewerMode: false,
		adminViewerModeReady: false,
		authError: "",
		authModalMode: "login" as AuthMode,
		authModalOpen: false,
		busy: false,
		bootstrapped: false,
		captcha: null as CaptchaChallenge | null
	}),

	getters: {
		showAdminTools: state =>
			state.account?.role === "admin" && !state.adminViewerMode,
		isAdmin: state => state.account?.role === "admin",
		isAuthenticated: state => Boolean(state.account)
	},

	actions: {
		initializeAdminViewerMode() {
			if (this.adminViewerModeReady) {
				return;
			}

			if (typeof window !== "undefined") {
				this.adminViewerMode =
					window.localStorage.getItem(ADMIN_VIEWER_MODE_KEY) === "1";
			}

			this.adminViewerModeReady = true;
		},

		setAdminViewerMode(nextValue: boolean) {
			this.adminViewerMode = nextValue;

			if (typeof window !== "undefined") {
				window.localStorage.setItem(
					ADMIN_VIEWER_MODE_KEY,
					nextValue ? "1" : "0"
				);
			}
		},

		toggleAdminViewerMode() {
			this.setAdminViewerMode(!this.adminViewerMode);
		},

		openAuth(mode: AuthMode) {
			this.authError = "";
			this.authModalMode = mode;
			this.authModalOpen = true;
			if (mode === "signup") {
				void this.refreshCaptcha();
			}
		},

		closeAuth() {
			this.authError = "";
			this.authModalOpen = false;
		},

		async refreshCaptcha() {
			try {
				const { data } =
					await api.get<CaptchaChallenge>("/auth/captcha");
				this.captcha = data;
				this.authError = "";
			} catch (error: any) {
				this.authError =
					error?.response?.data?.message ||
					error?.message ||
					"Unable to load captcha.";
			}
		},

		async bootstrapSession(force = false) {
			this.initializeAdminViewerMode();

			if (this.bootstrapped && !force) {
				return;
			}

			try {
				const { data } = await api.get<{
					account: SiteAccount | null;
					authenticated: boolean;
				}>("/auth/me");
				this.account = data.account;
			} catch {
				this.account = null;
			} finally {
				this.bootstrapped = true;
			}
		},

		async login(payload: { email: string; password: string }) {
			this.busy = true;
			this.authError = "";
			try {
				const { data } = await api.post<{ account: SiteAccount }>(
					"/auth/login",
					payload
				);
				this.account = data.account;
				this.closeAuth();
				return data.account;
			} catch (error: any) {
				this.authError =
					error?.response?.data?.message ||
					error?.message ||
					"Unable to sign in.";
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async signup(payload: {
			captchaResponse: string;
			email: string;
			name: string;
			password: string;
		}) {
			this.busy = true;
			this.authError = "";
			try {
				const { data } = await api.post<{ account: SiteAccount }>(
					"/auth/signup",
					payload
				);
				this.account = data.account;
				this.closeAuth();
				this.captcha = null;
				return data.account;
			} catch (error: any) {
				this.authError =
					error?.response?.data?.message ||
					error?.message ||
					"Unable to create your account.";
				await this.refreshCaptcha();
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async logout() {
			try {
				await api.post("/auth/logout");
			} catch {
				await api.delete("/accounts/logout");
			} finally {
				this.account = null;
			}
		}
	}
});
