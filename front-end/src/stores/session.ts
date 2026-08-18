import type {
	PublicKeyCredentialCreationOptionsJSON,
	PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser";
import type { SiteAccount } from "@/types/site";

import { browserSupportsWebAuthn, startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { defineStore } from "pinia";

import { api } from "@/api";

const ADMIN_VIEWER_MODE_KEY = "retrozetro:admin-viewer-mode";
type AuthStep = "authenticate" | "enroll" | "password" | "recovery-codes";

function errorMessage(error: any, fallback: string) {
	if (error?.name === "NotAllowedError") {
		return "The passkey window was closed or timed out. Choose the passkey button when you are ready.";
	}
	return error?.response?.data?.message || error?.message || fallback;
}

export const useSessionStore = defineStore("session", {
	state: () => ({
		account: null as SiteAccount | null,
		adminViewerMode: false,
		adminViewerModeReady: false,
		authError: "",
		authModalOpen: false,
		authStep: "password" as AuthStep,
		busy: false,
		bootstrapped: false,
		passkeysSupported: true,
		recoveryCodes: [] as string[]
	}),

	getters: {
		showAdminTools: state => state.account?.role === "admin" && !state.adminViewerMode,
		isAdmin: state => state.account?.role === "admin",
		isAuthenticated: state => Boolean(state.account)
	},

	actions: {
		initializeAdminViewerMode() {
			if (this.adminViewerModeReady) {
				return;
			}

			if (typeof window !== "undefined") {
				try {
					this.adminViewerMode = window.localStorage.getItem(ADMIN_VIEWER_MODE_KEY) === "1";
				} catch {
					this.adminViewerMode = false;
				}
			}

			this.adminViewerModeReady = true;
		},

		setAdminViewerMode(nextValue: boolean) {
			this.adminViewerMode = nextValue;

			if (typeof window !== "undefined") {
				try {
					window.localStorage.setItem(ADMIN_VIEWER_MODE_KEY, nextValue ? "1" : "0");
				} catch {
					// The active view still changes even when private browsing blocks storage.
				}
			}
		},

		toggleAdminViewerMode() {
			this.setAdminViewerMode(!this.adminViewerMode);
		},

		openAuth() {
			this.authError = "";
			this.passkeysSupported = typeof window === "undefined" || browserSupportsWebAuthn();
			this.authModalOpen = true;
		},

		closeAuth() {
			this.authError = "";
			this.authModalOpen = false;
			this.authStep = "password";
			this.recoveryCodes = [];
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
					mfa?: { mode?: "authenticate" | "enroll"; required: boolean };
				}>("/auth/me");
				this.account = data.account;
				if (data.mfa?.required && data.mfa.mode) {
					this.authStep = data.mfa.mode;
					this.openAuth();
				}
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
				const { data } = await api.post<{
					account: SiteAccount | null;
					authenticated: boolean;
					mfa: { mode: "authenticate" | "enroll"; required: true };
				}>("/auth/login", payload);
				this.account = data.account;
				this.authStep = data.mfa.mode;
				return data.account;
			} catch (error: any) {
				this.authError = errorMessage(error, "Unable to sign in.");
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async registerPasskey() {
			this.busy = true;
			this.authError = "";
			try {
				if (!browserSupportsWebAuthn()) {
					throw new Error(
						"This browser cannot create a passkey. Use a current browser or ask for owner sign-in help."
					);
				}
				const { data: optionData } = await api.post<{
					options: PublicKeyCredentialCreationOptionsJSON;
				}>("/auth/mfa/passkey/registration/options", {});
				const response = await startRegistration({ optionsJSON: optionData.options });
				const { data } = await api.post<{
					account: SiteAccount;
					authenticated: true;
					recoveryCodes: string[];
				}>("/auth/mfa/passkey/registration/verify", response);
				this.account = data.account;
				this.recoveryCodes = data.recoveryCodes;
				if (data.recoveryCodes.length > 0) {
					this.authStep = "recovery-codes";
				} else {
					this.closeAuth();
				}
				return data.account;
			} catch (error: any) {
				this.authError = errorMessage(error, "The passkey could not be set up.");
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async authenticatePasskey() {
			this.busy = true;
			this.authError = "";
			try {
				if (!browserSupportsWebAuthn()) {
					throw new Error(
						"This browser cannot use a passkey. Use a recovery code or ask for owner sign-in help."
					);
				}
				const { data: optionData } = await api.post<{
					options: PublicKeyCredentialRequestOptionsJSON;
				}>("/auth/mfa/passkey/authentication/options", {});
				const response = await startAuthentication({ optionsJSON: optionData.options });
				const { data } = await api.post<{
					account: SiteAccount;
					authenticated: true;
				}>("/auth/mfa/passkey/authentication/verify", response);
				this.account = data.account;
				this.closeAuth();
				return data.account;
			} catch (error: any) {
				this.authError = errorMessage(error, "The passkey could not confirm this sign-in.");
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async useRecoveryCode(code: string) {
			this.busy = true;
			this.authError = "";
			try {
				const { data } = await api.post<{
					account: SiteAccount;
					authenticated: true;
				}>("/auth/mfa/recovery", { code });
				this.account = data.account;
				this.closeAuth();
				return data.account;
			} catch (error: any) {
				this.authError = errorMessage(error, "That recovery code could not be used.");
				throw error;
			} finally {
				this.busy = false;
			}
		},

		async cancelAuthentication() {
			try {
				if (!this.account && this.authStep !== "password") {
					await api.post("/auth/mfa/cancel", {});
				}
			} finally {
				this.closeAuth();
			}
		},

		async logout() {
			try {
				await api.post("/auth/logout", {});
			} finally {
				this.account = null;
			}
		}
	}
});
