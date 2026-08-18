<script lang="ts" setup>
import { onMounted, ref } from "vue";

import { api } from "@/api";
import { useSessionStore } from "@/stores/session";

interface MfaStatus {
	enrolledAt: string | null;
	passkeyCount: number;
	recoveryCodesRemaining: number;
}

const session = useSessionStore();
const status = ref<MfaStatus | null>(null);
const recoveryCodes = ref<string[]>([]);
const busy = ref(false);
const error = ref("");
const message = ref("");

function messageFromError(caught: any, fallback: string) {
	return caught?.response?.data?.message || caught?.message || fallback;
}

async function loadStatus() {
	try {
		const response = await api.get<MfaStatus>("/auth/mfa/status");
		status.value = response.data;
	} catch (caught: any) {
		error.value = messageFromError(caught, "Account security details could not be loaded.");
	}
}

async function addPasskey() {
	busy.value = true;
	error.value = "";
	message.value = "";
	try {
		await session.registerPasskey();
		message.value = "Another passkey is now connected to the owner account.";
		await loadStatus();
	} catch (caught: any) {
		error.value = messageFromError(caught, "The passkey could not be added.");
	} finally {
		busy.value = false;
	}
}

async function replaceRecoveryCodes() {
	busy.value = true;
	error.value = "";
	message.value = "";
	try {
		await session.authenticatePasskey();
		const response = await api.post<{ recoveryCodes: string[] }>("/auth/mfa/recovery/regenerate", {});
		recoveryCodes.value = response.data.recoveryCodes;
		message.value = "The old recovery codes no longer work. Save these replacement codes now.";
		await loadStatus();
	} catch (caught: any) {
		error.value = messageFromError(caught, "Recovery codes could not be replaced.");
	} finally {
		busy.value = false;
	}
}

async function copyRecoveryCodes() {
	try {
		await navigator.clipboard.writeText(recoveryCodes.value.join("\n"));
		message.value = "Recovery codes copied. Save them somewhere private.";
	} catch {
		error.value = "Copy was blocked. Select the codes below and save them somewhere private.";
	}
}

onMounted(() => {
	void loadStatus();
});
</script>

<template>
	<section class="security-panel" aria-labelledby="security-panel-title">
		<header>
			<p>Account security</p>
			<h2 id="security-panel-title">Passkeys and recovery codes</h2>
			<p>
				A passkey uses this device's fingerprint, face, screen lock, or security key. It protects the owner
				workspace even if someone learns the password.
			</p>
		</header>

		<p v-if="error" class="security-panel__message security-panel__message--error" role="alert">{{ error }}</p>
		<p v-if="message" class="security-panel__message" role="status">{{ message }}</p>

		<dl v-if="status" class="security-panel__status">
			<div>
				<dt>Connected passkeys</dt>
				<dd>{{ status.passkeyCount }}</dd>
			</div>
			<div>
				<dt>Unused recovery codes</dt>
				<dd>{{ status.recoveryCodesRemaining }}</dd>
			</div>
		</dl>

		<div class="security-panel__actions">
			<button :disabled="busy" type="button" @click="addPasskey">
				{{ busy ? "Please wait..." : "Add another passkey" }}
			</button>
			<button :disabled="busy" type="button" @click="replaceRecoveryCodes">Replace all recovery codes</button>
		</div>

		<div v-if="recoveryCodes.length" class="security-panel__codes">
			<h3>New one-time recovery codes</h3>
			<p>These codes will not be shown again. Each code works once.</p>
			<ul aria-label="New one-time recovery codes">
				<li v-for="code in recoveryCodes" :key="code">
					<code>{{ code }}</code>
				</li>
			</ul>
			<button type="button" @click="copyRecoveryCodes">Copy all codes</button>
		</div>
	</section>
</template>

<style scoped>
.security-panel,
.security-panel header,
.security-panel__codes {
	display: grid;
	gap: 0.8rem;
}

.security-panel {
	border: 1px solid rgba(124, 225, 246, 0.24);
	border-radius: var(--radius-panel);
	background: rgba(124, 225, 246, 0.07);
	padding: clamp(1rem, 3vw, 1.5rem);
}

.security-panel h2,
.security-panel h3,
.security-panel p,
.security-panel dl {
	margin: 0;
}

.security-panel header > p:first-child {
	color: #7ce1f6;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.security-panel header > p:last-child,
.security-panel__codes > p {
	max-width: 70ch;
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.65;
}

.security-panel__message {
	border-radius: var(--radius-control);
	background: rgba(124, 225, 246, 0.12);
	color: #eaffff;
	padding: 0.8rem;
}

.security-panel__message--error {
	background: rgba(255, 143, 143, 0.12);
	color: #ffdada;
}

.security-panel__status {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.75rem;
}

.security-panel__status > div {
	border-radius: var(--radius-card);
	background: rgba(0, 0, 0, 0.18);
	padding: 0.9rem;
}

.security-panel__status dt {
	color: rgba(255, 255, 255, 0.68);
}

.security-panel__status dd {
	margin: 0.25rem 0 0;
	font-size: 1.6rem;
	font-weight: 900;
}

.security-panel__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.security-panel button {
	min-height: 2.8rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-pill);
	background: #ffd27d;
	color: #1b0328;
	cursor: pointer;
	font: inherit;
	font-weight: 900;
	padding: 0.7rem 1rem;
}

.security-panel button:disabled {
	cursor: wait;
	opacity: 0.65;
}

.security-panel__codes ul {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.55rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.security-panel__codes code {
	display: block;
	border-radius: var(--radius-control);
	background: rgba(0, 0, 0, 0.25);
	color: #fff4e7;
	padding: 0.65rem;
	text-align: center;
	user-select: all;
}

@media (max-width: 560px) {
	.security-panel__status,
	.security-panel__codes ul {
		grid-template-columns: 1fr;
	}
}
</style>
