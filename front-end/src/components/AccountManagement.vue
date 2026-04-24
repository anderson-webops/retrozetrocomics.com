<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { reactive, ref, watch } from "vue";

import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const { authModalOpen, authError, busy } = storeToRefs(session);

const loginForm = reactive({
	email: "",
	password: ""
});

const localError = ref("");

function resetForm() {
	loginForm.email = "";
	loginForm.password = "";
	localError.value = "";
}

watch(authModalOpen, open => {
	if (!open) {
		resetForm();
	}
});

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
</script>

<template>
	<Teleport to="body">
		<div
			v-if="authModalOpen"
			class="auth-overlay"
			role="presentation"
			@click.self="session.closeAuth()"
		>
			<div
				aria-labelledby="admin-login-heading"
				aria-modal="true"
				class="auth-modal"
				role="dialog"
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
					<p>
						Sign in only when you need to edit site content or
						review owner activity.
					</p>
				</div>

				<form class="auth-form" @submit.prevent="submitLogin">
					<label>
						<span>Email</span>
						<input
							v-model="loginForm.email"
							autocomplete="email"
							required
							type="email"
						/>
					</label>

					<label>
						<span>Password</span>
						<input
							v-model="loginForm.password"
							autocomplete="current-password"
							minlength="8"
							required
							type="password"
						/>
					</label>

					<p v-if="localError || authError" class="auth-form__error">
						{{ localError || authError }}
					</p>

					<button
						class="auth-form__submit"
						:disabled="busy"
						type="submit"
					>
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
	background:
		linear-gradient(135deg, rgba(255, 145, 77, 0.16), transparent 46%),
		rgba(255, 255, 255, 0.04);
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
