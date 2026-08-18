<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";

import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const { authModalOpen, authError, busy } = storeToRefs(session);

const loginForm = reactive({
	email: "",
	password: ""
});

const localError = ref("");
const showPassword = ref(false);
const dialog = ref<HTMLElement | null>(null);
const emailInput = ref<HTMLInputElement | null>(null);
let returnFocus: HTMLElement | null = null;

function resetForm() {
	loginForm.email = "";
	loginForm.password = "";
	localError.value = "";
	showPassword.value = false;
}

watch(authModalOpen, async open => {
	if (open) {
		returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		await nextTick();
		emailInput.value?.focus();
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
		session.closeAuth();
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
		<div v-if="authModalOpen" class="auth-overlay" role="presentation" @click.self="session.closeAuth()">
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
					@click="session.closeAuth()"
				>
					&times;
				</button>

				<div class="auth-modal__hero">
					<p class="auth-modal__eyebrow">Owner Access</p>
					<h2 id="admin-login-heading">Admin sign in</h2>
					<p id="admin-login-description">
						Sign in only when you need to edit site content or review owner activity.
					</p>
				</div>

				<form class="auth-form" @submit.prevent="submitLogin">
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
</style>
