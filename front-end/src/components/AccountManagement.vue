<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";

import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const { authError, authModalOpen, authStep, busy, passkeysSupported, recoveryCodes } = storeToRefs(session);

const loginForm = reactive({
	email: "",
	password: ""
});
const recoveryForm = reactive({ code: "" });

const localError = ref("");
const showPassword = ref(false);
const dialog = ref<HTMLElement | null>(null);
const emailInput = ref<HTMLInputElement | null>(null);
const primaryAction = ref<HTMLButtonElement | null>(null);
let returnFocus: HTMLElement | null = null;

const heading = computed(
	() =>
		({
			authenticate: "Confirm with your passkey",
			enroll: "Protect owner access",
			password: "Admin sign in",
			"recovery-codes": "Save your recovery codes"
		})[authStep.value]
);
const description = computed(
	() =>
		({
			authenticate: "Use the fingerprint, face, screen lock, or security key already connected to this account.",
			enroll: "Create a passkey so a stolen password cannot open the owner workspace.",
			password: "Sign in only when you need to edit site content or review owner activity.",
			"recovery-codes":
				"These one-time codes are the backup if the passkey is unavailable. They will not be shown again."
		})[authStep.value]
);

function resetForm() {
	loginForm.email = "";
	loginForm.password = "";
	recoveryForm.code = "";
	localError.value = "";
	showPassword.value = false;
}

watch(authModalOpen, async open => {
	if (open) {
		returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		await nextTick();
		if (authStep.value === "password") emailInput.value?.focus();
		else primaryAction.value?.focus();
		return;
	}

	resetForm();
	await nextTick();
	returnFocus?.focus();
	returnFocus = null;
});

function handleDialogKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") {
		event.preventDefault();
		void session.cancelAuthentication();
		return;
	}
	if (event.key !== "Tab" || !dialog.value) return;

	const focusable = Array.from(
		dialog.value.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
		)
	);
	if (!focusable.length) return;

	const first = focusable[0];
	const last = focusable.at(-1);
	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last?.focus();
	} else if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

async function setUpPasskey() {
	localError.value = "";
	try {
		await session.registerPasskey();
	} catch {
		localError.value = authError.value || "The passkey could not be set up.";
	}
}

async function confirmPasskey() {
	localError.value = "";
	try {
		await session.authenticatePasskey();
	} catch {
		localError.value = authError.value || "The passkey could not confirm this sign-in.";
	}
}

async function submitRecoveryCode() {
	localError.value = "";
	try {
		await session.useRecoveryCode(recoveryForm.code);
		recoveryForm.code = "";
	} catch {
		localError.value = authError.value || "That recovery code could not be used.";
	}
}

async function copyRecoveryCodes() {
	localError.value = "";
	try {
		await navigator.clipboard.writeText(recoveryCodes.value.join("\n"));
		localError.value = "Recovery codes copied. Save them somewhere private.";
	} catch {
		localError.value = "Copy was blocked. Select the codes below and save them somewhere private.";
	}
}

async function submitLogin() {
	localError.value = "";
	try {
		await session.login({
			email: loginForm.email,
			password: loginForm.password
		});
		resetForm();
	} catch {
		localError.value = authError.value || "Unable to sign in right now.";
	}
}

onBeforeUnmount(() => {
	returnFocus?.focus();
});
</script>

<template>
	<Teleport to="body">
		<div v-if="authModalOpen" class="auth-overlay" role="presentation" @click.self="session.cancelAuthentication()">
			<div
				ref="dialog"
				aria-describedby="admin-login-description"
				aria-labelledby="admin-login-heading"
				aria-modal="true"
				class="auth-modal"
				role="dialog"
				@keydown="handleDialogKeydown"
			>
				<button
					aria-label="Close admin sign-in dialog"
					class="auth-modal__close"
					type="button"
					@click="session.cancelAuthentication()"
				>
					&times;
				</button>

				<div class="auth-modal__hero">
					<p class="auth-modal__eyebrow">Owner Access</p>
					<h2 id="admin-login-heading">{{ heading }}</h2>
					<p id="admin-login-description">{{ description }}</p>
				</div>

				<form v-if="authStep === 'password'" class="auth-form" @submit.prevent="submitLogin">
					<label>
						<span>Email</span>
						<input
							ref="emailInput"
							v-model="loginForm.email"
							:aria-describedby="localError || authError ? 'admin-login-error' : undefined"
							:aria-invalid="Boolean(localError || authError)"
							autocomplete="email"
							required
							type="email"
						/>
					</label>

					<label>
						<span>Password</span>
						<span class="auth-form__password">
							<input
								v-model="loginForm.password"
								:aria-describedby="localError || authError ? 'admin-login-error' : undefined"
								:aria-invalid="Boolean(localError || authError)"
								autocomplete="current-password"
								minlength="8"
								required
								:type="showPassword ? 'text' : 'password'"
							/>
							<button
								:aria-label="showPassword ? 'Hide password' : 'Show password'"
								type="button"
								@click="showPassword = !showPassword"
							>
								{{ showPassword ? "Hide" : "Show" }}
							</button>
						</span>
					</label>

					<p v-if="localError || authError" id="admin-login-error" class="auth-form__error" role="alert">
						{{ localError || authError }}
					</p>

					<p class="auth-form__help">
						Forgot the password or need help?
						<a href="mailto:retrozetrocomics@gmail.com?subject=RetroZetro%20owner%20sign-in%20help">
							Ask for owner sign-in help </a
						>.
					</p>

					<button class="auth-form__submit" :disabled="busy" type="submit">
						{{ busy ? "Signing in..." : "Sign in" }}
					</button>
				</form>

				<div v-else-if="authStep === 'enroll'" class="auth-form auth-step">
					<ol class="auth-step__list">
						<li>Choose the button below.</li>
						<li>Follow the device instructions for a fingerprint, face, screen lock, or security key.</li>
						<li>Save the recovery codes shown afterward.</li>
					</ol>
					<p v-if="!passkeysSupported" class="auth-form__error" role="alert">
						This browser cannot create a passkey. Open this page in a current browser or ask for owner
						sign-in help.
					</p>
					<p v-if="localError || authError" id="admin-login-error" class="auth-form__error" role="alert">
						{{ localError || authError }}
					</p>
					<button
						ref="primaryAction"
						class="auth-form__submit"
						:disabled="busy || !passkeysSupported"
						type="button"
						@click="setUpPasskey"
					>
						{{ busy ? "Opening passkey setup..." : "Set up my passkey" }}
					</button>
					<p class="auth-form__help">
						Need another person to help?
						<a href="mailto:retrozetrocomics@gmail.com?subject=RetroZetro%20passkey%20setup%20help">
							Ask for passkey setup help</a
						>.
					</p>
				</div>

				<div v-else-if="authStep === 'authenticate'" class="auth-form auth-step">
					<button
						ref="primaryAction"
						class="auth-form__submit"
						:disabled="busy || !passkeysSupported"
						type="button"
						@click="confirmPasskey"
					>
						{{ busy ? "Waiting for passkey..." : "Use my passkey" }}
					</button>
					<p v-if="localError || authError" id="admin-login-error" class="auth-form__error" role="alert">
						{{ localError || authError }}
					</p>
					<details class="auth-recovery">
						<summary>I cannot use my passkey</summary>
						<form @submit.prevent="submitRecoveryCode">
							<label>
								<span>One-time recovery code</span>
								<input
									v-model="recoveryForm.code"
									autocapitalize="characters"
									autocomplete="one-time-code"
									placeholder="RZ-1234-5678-90AB"
									required
									type="text"
								/>
							</label>
							<button :disabled="busy" type="submit">Use this recovery code</button>
						</form>
					</details>
				</div>

				<div v-else class="auth-form auth-step">
					<p class="auth-codes__warning">
						Keep these private. Each code works once. Saving them now prevents an account lockout later.
					</p>
					<ul class="auth-codes" aria-label="One-time recovery codes">
						<li v-for="code in recoveryCodes" :key="code">
							<code>{{ code }}</code>
						</li>
					</ul>
					<p v-if="localError" class="auth-form__help" role="status">{{ localError }}</p>
					<div class="auth-step__actions">
						<button ref="primaryAction" type="button" @click="copyRecoveryCodes">Copy all codes</button>
						<button class="auth-form__submit" type="button" @click="session.closeAuth()">
							I saved the codes — continue
						</button>
					</div>
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.auth-overlay {
	position: fixed;
	inset: 0;
	z-index: 100;
	display: grid;
	place-items: center;
	padding: 1rem;
	background: rgba(4, 8, 16, 0.72);
	backdrop-filter: blur(14px);
}

.auth-modal {
	position: relative;
	width: min(100%, 28rem);
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: var(--radius-panel);
	background: #101a2a;
	box-shadow: 0 28px 70px rgba(0, 0, 0, 0.46);
	color: #fff8ef;
}

.auth-modal__close {
	position: absolute;
	top: 0.8rem;
	right: 0.8rem;
	display: grid;
	width: 2.25rem;
	height: 2.25rem;
	place-items: center;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font-size: 1.35rem;
	line-height: 1;
}

.auth-modal__hero {
	display: grid;
	gap: 0.55rem;
	padding: clamp(1.4rem, 5vw, 2rem);
	background: linear-gradient(135deg, rgba(255, 145, 77, 0.16), transparent 46%), rgba(255, 255, 255, 0.04);
}

.auth-modal__hero h2,
.auth-modal__hero p {
	margin: 0;
}

.auth-modal__hero h2 {
	font-size: clamp(1.6rem, 5vw, 2.2rem);
}

.auth-modal__hero p {
	max-width: 32ch;
	color: rgba(255, 255, 255, 0.76);
	line-height: 1.65;
}

.auth-modal__eyebrow {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 800;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.auth-form {
	display: grid;
	gap: 1rem;
	padding: clamp(1.4rem, 5vw, 2rem);
}

.auth-form label {
	display: grid;
	gap: 0.45rem;
	color: rgba(255, 255, 255, 0.72);
	font-size: 0.78rem;
	font-weight: 800;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.auth-form input {
	width: 100%;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font: inherit;
	padding: 0.82rem 0.9rem;
}

.auth-form__password {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 0.55rem;
	align-items: stretch;
}

.auth-form__password button {
	min-width: 4.5rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-size: 0.82rem;
	font-weight: 850;
	letter-spacing: normal;
	padding: 0.65rem;
	text-transform: none;
}

.auth-form input:focus {
	border-color: #ffb36f;
	outline: 3px solid rgba(255, 179, 111, 0.18);
}

.auth-form__error {
	margin: 0;
	border: 1px solid rgba(255, 145, 77, 0.28);
	border-radius: var(--radius-control);
	background: rgba(255, 145, 77, 0.1);
	color: #ffd2ae;
	line-height: 1.55;
	padding: 0.78rem 0.9rem;
}

.auth-form__help {
	margin: 0;
	color: rgba(255, 255, 255, 0.68);
	font-size: 0.92rem;
	line-height: 1.6;
}

.auth-form__help a {
	color: #ffd27d;
	font-weight: 800;
}

.auth-form__submit {
	border: none;
	border-radius: var(--radius-pill);
	background: #ff914d;
	color: #160021;
	cursor: pointer;
	font-weight: 900;
	padding: 0.86rem 1.15rem;
}

.auth-form__submit:disabled {
	cursor: wait;
	opacity: 0.68;
}

.auth-step__list,
.auth-codes__warning {
	margin: 0;
	color: rgba(255, 255, 255, 0.78);
	line-height: 1.65;
}

.auth-step__list {
	display: grid;
	gap: 0.55rem;
	padding-left: 1.4rem;
}

.auth-recovery {
	border-top: 1px solid rgba(255, 255, 255, 0.12);
	padding-top: 0.9rem;
}

.auth-recovery summary {
	cursor: pointer;
	color: #ffd27d;
	font-weight: 800;
}

.auth-recovery form {
	display: grid;
	gap: 0.8rem;
	padding-top: 0.9rem;
}

.auth-recovery button,
.auth-step__actions > button:not(.auth-form__submit) {
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-weight: 800;
	padding: 0.8rem 1rem;
}

.auth-codes {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 0.55rem;
	margin: 0;
	padding: 0;
	list-style: none;
}

.auth-codes code {
	display: block;
	border-radius: var(--radius-control);
	background: rgba(0, 0, 0, 0.28);
	color: #fff4e7;
	font-size: 0.92rem;
	padding: 0.65rem;
	text-align: center;
	user-select: all;
}

.auth-step__actions {
	display: grid;
	gap: 0.7rem;
}

@media (max-width: 480px) {
	.auth-codes {
		grid-template-columns: 1fr;
	}
}
</style>
