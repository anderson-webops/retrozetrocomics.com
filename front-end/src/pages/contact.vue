<script lang="ts" setup>
import { ref } from "vue";
import { api } from "@/api";
import { siteAssetCandidates, toAbsoluteSiteUrl } from "@/lib/siteAssets";
import { useMainStore } from "~/stores";

const store = useMainStore();

const form = ref({
	subject: "",
	name: "",
	email: "",
	message: "",
	website: ""
});

const responseMessage = ref("");
const responseTone = ref<"success" | "error">("success");
const isSubmitting = ref(false);

useHead({
	title: "Contact | RetroZetro Comics",
	link: [
		{
			rel: "canonical",
			href: toAbsoluteSiteUrl("/contact")
		}
	],
	meta: [
		{
			name: "description",
			content:
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and project questions."
		},
		{
			property: "og:title",
			content: "Contact | RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and project questions."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/contact")
		},
		{
			name: "twitter:title",
			content: "Contact | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and project questions."
		}
	]
});

async function handleSubmit() {
	isSubmitting.value = true;
	responseMessage.value = "";

	try {
		await api.post("/contact", form.value);
		responseTone.value = "success";
		responseMessage.value =
			"Message sent. RetroZetro will follow up through the email address you provided.";

		form.value.subject = "";
		form.value.name = "";
		form.value.email = "";
		form.value.message = "";
		form.value.website = "";
	} catch (error: unknown) {
		console.error("RetroZetro contact form failed:", error);
		responseTone.value = "error";
		const response = (error as { response?: { data?: { error?: string } } })
			.response;
		const errorMessage = response?.data?.error;
		responseMessage.value =
			errorMessage ||
			"The message could not be sent right now. Please try again later.";
	} finally {
		isSubmitting.value = false;
	}
}
</script>

<template>
	<div class="page contact-page">
		<WelcomeSection
			:actions="[
				{
					href: 'mailto:retrozetrocomics@gmail.com',
					label: 'Email RetroZetro',
					style: 'primary'
				}
			]"
			actions-placement="poster"
			eyebrow="Contact"
			:highlights="[]"
			:image-candidates="siteAssetCandidates.contactLogo"
			image-alt="RetroZetro logo mark"
			:message="store.contact.description"
			:title="store.contact.title"
		/>

		<section class="contact-page__grid">
			<form class="contact-form" @submit.prevent="handleSubmit">
				<h2>Send a message</h2>
				<label for="subject">Subject</label>
				<input
					id="subject"
					v-model="form.subject"
					placeholder="Commission, press request, collaboration..."
					required
					type="text"
				/>

				<label for="name">Name</label>
				<input id="name" v-model="form.name" required type="text" />

				<label for="email">Email</label>
				<input id="email" v-model="form.email" required type="email" />

				<label for="message">Message</label>
				<textarea
					id="message"
					v-model="form.message"
					placeholder="Share what you need, your timeline, and any useful links."
					required
					rows="7"
				/>

				<input
					v-model="form.website"
					type="text"
					name="website"
					autocomplete="off"
					tabindex="-1"
					class="sr-only"
					aria-hidden="true"
				/>

				<button type="submit" :disabled="isSubmitting">
					{{ isSubmitting ? "Sending..." : "Send message" }}
				</button>

				<p
					v-if="responseMessage"
					class="contact-form__response"
					:class="
						responseTone === 'error'
							? 'contact-form__response--error'
							: ''
					"
				>
					{{ responseMessage }}
				</p>
			</form>

			<article class="contact-panel">
				<p class="contact-panel__eyebrow">FAQ</p>
				<h2>Before you hit send</h2>
				<div class="contact-panel__faq">
					<div v-for="item in store.contact.faq" :key="item.question">
						<h3>{{ item.question }}</h3>
						<p>{{ item.answer }}</p>
					</div>
				</div>
			</article>
		</section>
	</div>
</template>

<style scoped>
.contact-page {
	display: grid;
	gap: 1.8rem;
}

.contact-page__grid {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
}

.contact-panel,
.contact-form {
	display: grid;
	gap: 1rem;
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.contact-panel--warm {
	background: rgba(255, 255, 255, 0.04);
}

.contact-panel h2,
.contact-form h2,
.contact-panel h3,
.contact-panel p,
.contact-panel a,
.contact-form label,
.contact-form__response {
	margin: 0;
}

.contact-panel h2,
.contact-form h2 {
	font-family: var(--font-display);
	font-size: clamp(1.8rem, 4vw, 2.4rem);
	color: #fff4e7;
}

.contact-panel h3 {
	color: #fff4e7;
	font-size: 1.08rem;
}

.contact-panel__eyebrow {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
}

.contact-panel__list,
.contact-panel__tags,
.contact-panel__faq {
	display: grid;
	gap: 0.9rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.contact-panel__list li,
.contact-panel__faq > div {
	display: grid;
	gap: 0.3rem;
	padding: 1rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.04);
}

.contact-panel__list a {
	color: #7ce1f6;
	text-decoration: none;
}

.contact-panel__list p,
.contact-panel__faq p {
	color: rgba(239, 244, 255, 0.76);
	line-height: 1.7;
}

.contact-panel__tags {
	grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.contact-panel__tags li {
	padding: 1rem;
	border-radius: var(--radius-card);
	background: rgba(255, 255, 255, 0.04);
	color: rgba(239, 244, 255, 0.82);
	line-height: 1.6;
}

.contact-form label {
	color: #fff4e7;
	font-size: 0.9rem;
}

.contact-form input,
.contact-form textarea {
	width: 100%;
	padding: 0.95rem 1rem;
	border-radius: var(--radius-field);
	border: 1px solid rgba(255, 255, 255, 0.14);
	background: rgba(10, 18, 31, 0.5);
	color: #eff4ff;
}

.contact-form button {
	justify-self: start;
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.85rem 1.2rem;
	background: #ff9459;
	color: #08111f;
	font-weight: 800;
	cursor: pointer;
}

.contact-form__response {
	color: #7ce1f6;
	line-height: 1.7;
}

.contact-form__response--error {
	color: #ffb1a1;
}

@media (max-width: 800px) {
	.contact-page__grid {
		grid-template-columns: 1fr;
	}
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
