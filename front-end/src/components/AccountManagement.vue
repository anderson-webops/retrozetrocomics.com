<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { reactive, ref, watch } from "vue";

import { useSessionStore } from "@/stores/session";

const session = useSessionStore();
const { account, authModalMode, authModalOpen, authError, busy, captcha } =
	storeToRefs(session);

const loginForm = reactive({
	email: "",
	password: ""
});

const signupForm = reactive({
	captchaResponse: "",
	email: "",
	name: "",
	password: "",
	passwordConfirm: ""
});

const localError = ref("");

const passwordsMatch = computed(
	() => signupForm.password === signupForm.passwordConfirm
);

function resetForms() {
	loginForm.email = "";
	loginForm.password = "";
	signupForm.captchaResponse = "";
	signupForm.email = "";
	signupForm.name = "";
	signupForm.password = "";
	signupForm.passwordConfirm = "";
	localError.value = "";
}

watch(authModalOpen, open => {
	if (!open) {
		resetForms();
	}
});

watch(
	() => [authModalOpen.value, authModalMode.value] as const,
	async ([open, mode]) => {
		if (open && mode === "signup" && !captcha.value) {
			await session.refreshCaptcha();
		}
	}
);

async function submitLogin() {
	localError.value = "";
	try {
		await session.login({
			email: loginForm.email,
			password: loginForm.password
		});
		resetForms();
	} catch {
		localError.value = authError.value || "Unable to sign in right now.";
	}
}

async function submitSignup() {
	localError.value = "";
	if (!passwordsMatch.value) {
		localError.value = "Passwords do not match.";
		return;
	}

	try {
		await session.signup({
			captchaResponse: signupForm.captchaResponse,
			email: signupForm.email,
			name: signupForm.name,
			password: signupForm.password
		});
		resetForms();
	} catch {
		localError.value = authError.value || "Unable to create your account.";
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
				class="auth-modal"
				aria-modal="true"
				role="dialog"
				:aria-labelledby="`auth-heading-${authModalMode}`"
			>
				<button
					aria-label="Close account dialog"
					class="auth-modal__close"
					type="button"
					@click="session.closeAuth()"
				>
					&times;
				</button>

				<div class="auth-modal__hero">
					<p class="auth-modal__eyebrow">Retroverse Access</p>
					<h2 :id="`auth-heading-${authModalMode}`">
						{{
							authModalMode === "login"
								? "Welcome back"
								: "Join the community"
						}}
					</h2>
					<p>
						{{
							authModalMode === "login"
								? "Sign in to comment on new drops and keep up with the latest creator notes."
								: "Create an account to comment on comics, storyboard drafts, and photo journals."
						}}
					</p>
				</div>

				<div class="auth-modal__switcher">
					<button
						class="auth-modal__switch"
						:class="{
							'auth-modal__switch--active':
								authModalMode === 'login'
						}"
						type="button"
						@click="session.openAuth('login')"
					>
						Login
					</button>
					<button
						class="auth-modal__switch"
						:class="{
							'auth-modal__switch--active':
								authModalMode === 'signup'
						}"
						type="button"
						@click="session.openAuth('signup')"
					>
						Sign Up
					</button>
				</div>

				<form
					v-if="authModalMode === 'login'"
					class="auth-form"
					@submit.prevent="submitLogin"
				>
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
						{{ busy ? "Signing in..." : "Sign In" }}
					</button>

					<p class="auth-form__meta">
						New here?
						<button
							class="auth-form__link"
							type="button"
							@click="session.openAuth('signup')"
						>
							Create an account
						</button>
					</p>
				</form>

				<form v-else class="auth-form" @submit.prevent="submitSignup">
					<label>
						<span>Name</span>
						<input
							v-model="signupForm.name"
							autocomplete="name"
							maxlength="80"
							minlength="2"
							required
							type="text"
						/>
					</label>

					<label>
						<span>Email</span>
						<input
							v-model="signupForm.email"
							autocomplete="email"
							required
							type="email"
						/>
					</label>

					<div class="auth-form__grid">
						<label>
							<span>Password</span>
							<input
								v-model="signupForm.password"
								autocomplete="new-password"
								minlength="8"
								required
								type="password"
							/>
						</label>

						<label>
							<span>Confirm Password</span>
							<input
								v-model="signupForm.passwordConfirm"
								autocomplete="new-password"
								minlength="8"
								required
								type="password"
							/>
						</label>
					</div>

					<div class="captcha-block">
						<div class="captcha-block__image">
							<img
								v-if="captcha"
								:alt="`Captcha prompt ${captcha.prompt}`"
								:src="captcha.imageDataUrl"
							/>
						</div>
						<div class="captcha-block__body">
							<p>Solve the challenge to finish signing up.</p>
							<label>
								<span>Captcha Answer</span>
								<input
									v-model="signupForm.captchaResponse"
									inputmode="numeric"
									required
									type="text"
								/>
							</label>
							<button
								class="auth-form__link auth-form__link--button"
								type="button"
								@click="session.refreshCaptcha()"
							>
								Refresh captcha
							</button>
						</div>
					</div>

					<p
						v-if="localError || authError || !passwordsMatch"
						class="auth-form__error"
					>
						{{
							localError ||
							authError ||
							(!passwordsMatch ? "Passwords do not match." : "")
						}}
					</p>

					<button
						class="auth-form__submit"
						:disabled="busy"
						type="submit"
					>
						{{ busy ? "Creating account..." : "Create Account" }}
					</button>

					<p class="auth-form__meta">
						Already a member?
						<button
							class="auth-form__link"
							type="button"
							@click="session.openAuth('login')"
						>
							Sign in instead
						</button>
					</p>
				</form>

				<div v-if="account" class="auth-modal__status">
					Signed in as {{ account.name }}.
				</div>
			</div>
		</div>
	</Teleport>
</template>

<style scoped>
.auth-overlay {
	position: fixed;
	inset: 0;
	z-index: 90;
	display: grid;
	place-items: center;
	padding: 1.25rem;
	background: rgba(8, 0, 15, 0.74);
	backdrop-filter: blur(12px);
}

.auth-modal {
	position: relative;
	width: min(720px, 100%);
	display: grid;
	gap: 1.5rem;
	padding: clamp(1.5rem, 4vw, 2.25rem);
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 145, 77, 0.22),
			transparent 38%
		),
		radial-gradient(
			circle at bottom left,
			rgba(122, 75, 180, 0.35),
			transparent 45%
		),
		linear-gradient(165deg, rgba(26, 6, 40, 0.98), rgba(12, 2, 20, 0.98));
	border: 1px solid rgba(255, 255, 255, 0.1);
	box-shadow: 0 26px 60px rgba(0, 0, 0, 0.4);
	color: #f6e8ff;
}

.auth-modal__close {
	position: absolute;
	top: 1rem;
	right: 1rem;
	border: none;
	background: transparent;
	color: #ffb36f;
	font-size: 2rem;
	line-height: 1;
	cursor: pointer;
}

.auth-modal__hero {
	display: grid;
	gap: 0.55rem;
}

.auth-modal__hero h2 {
	margin: 0;
	font-size: clamp(2rem, 5vw, 2.6rem);
}

.auth-modal__hero p {
	margin: 0;
	color: rgba(255, 255, 255, 0.76);
	line-height: 1.65;
}

.auth-modal__eyebrow {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.24em;
	font-size: 0.78rem;
	color: #ffb36f;
}

.auth-modal__switcher {
	display: inline-grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	padding: 0.35rem;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.07);
}

.auth-modal__switch {
	border: none;
	border-radius: 999px;
	background: transparent;
	color: rgba(255, 255, 255, 0.65);
	padding: 0.8rem 1rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
	cursor: pointer;
}

.auth-modal__switch--active {
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #1b0228;
}

.auth-form {
	display: grid;
	gap: 1rem;
}

.auth-form label {
	display: grid;
	gap: 0.45rem;
}

.auth-form span {
	font-size: 0.85rem;
	text-transform: uppercase;
	letter-spacing: 0.1em;
	color: rgba(255, 255, 255, 0.68);
}

.auth-form input {
	width: 100%;
	padding: 0.95rem 1rem;
	border-radius: 14px;
	border: 1px solid rgba(255, 255, 255, 0.14);
	background: rgba(255, 255, 255, 0.06);
	color: #fdf7ff;
}

.auth-form__grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 1rem;
}

.captcha-block {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
	gap: 1rem;
	padding: 1rem;
	border-radius: 18px;
	background: rgba(255, 255, 255, 0.04);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.captcha-block__image {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0.75rem;
	border-radius: 16px;
	background: rgba(12, 2, 20, 0.65);
}

.captcha-block__image img {
	width: 100%;
	max-width: 260px;
	display: block;
}

.captcha-block__body {
	display: grid;
	gap: 0.75rem;
	align-content: start;
}

.captcha-block__body p {
	margin: 0;
	color: rgba(255, 255, 255, 0.74);
	line-height: 1.6;
}

.auth-form__submit {
	border: none;
	border-radius: 999px;
	padding: 0.9rem 1.2rem;
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #160021;
	font-weight: 800;
	text-transform: uppercase;
	letter-spacing: 0.14em;
	cursor: pointer;
}

.auth-form__submit:disabled {
	opacity: 0.65;
	cursor: progress;
}

.auth-form__error {
	margin: 0;
	color: #ffb8b8;
	font-weight: 600;
}

.auth-form__meta {
	margin: 0;
	color: rgba(255, 255, 255, 0.68);
}

.auth-form__link {
	border: none;
	background: transparent;
	color: #ffb36f;
	font: inherit;
	cursor: pointer;
	padding: 0;
}

.auth-form__link--button {
	justify-self: start;
	font-weight: 700;
}

.auth-modal__status {
	color: rgba(255, 255, 255, 0.72);
	font-size: 0.92rem;
}

@media (max-width: 720px) {
	.auth-form__grid,
	.captcha-block {
		grid-template-columns: 1fr;
	}
}
</style>
