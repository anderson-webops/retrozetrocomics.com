<script lang="ts" setup>
import { ref } from "vue";
import { siteAssetCandidates, toAbsoluteSiteUrl } from "@/lib/siteAssets";
import { useMainStore } from "~/stores";

const store = useMainStore();

const form = ref({
	subject: "",
	name: "",
	email: "",
	message: ""
});

const responseMessage = ref("");

useHead({
	title: "Contact the Studio | RetroZetro Comics",
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
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and studio inquiries."
		},
		{
			property: "og:title",
			content: "Contact the Studio | RetroZetro Comics"
		},
		{
			property: "og:description",
			content:
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and studio inquiries."
		},
		{
			property: "og:url",
			content: toAbsoluteSiteUrl("/contact")
		},
		{
			name: "twitter:title",
			content: "Contact the Studio | RetroZetro Comics"
		},
		{
			name: "twitter:description",
			content:
				"Contact RetroZetro Comics for collaboration, commissions, interviews, and studio inquiries."
		}
	]
});

function handleSubmit() {
	const subject = encodeURIComponent(
		`[RetroZetro] ${form.value.subject || "Website inquiry"}`
	);
	const body = encodeURIComponent(
		`Name: ${form.value.name}\nEmail: ${form.value.email}\n\n${form.value.message}`
	);

	if (typeof window !== "undefined") {
		window.location.href = `mailto:retrozetrocomics@gmail.com?subject=${subject}&body=${body}`;
	}

	responseMessage.value =
		"Your email app should open with the draft message. If it does not, use retrozetrocomics@gmail.com directly.";

	form.value.subject = "";
	form.value.name = "";
	form.value.email = "";
	form.value.message = "";
}
</script>

<template>
	<div class="page contact-page">
		<WelcomeSection
			:actions="[
				{
					href: 'mailto:retrozetrocomics@gmail.com',
					label: 'Email the studio',
					style: 'primary'
				},
				{
					label: 'Browse the archive',
					style: 'secondary',
					to: '/studio'
				}
			]"
			actions-placement="poster"
			eyebrow="Contact the Studio"
			:highlights="
				store.contact.channels.map(channel => ({
					description: channel.note,
					term: channel.label
				}))
			"
			:image-candidates="siteAssetCandidates.contactLogo"
			image-alt="RetroZetro logo mark"
			:message="store.contact.description"
			:title="store.contact.title"
		/>

		<section class="contact-page__grid">
			<article class="contact-panel">
				<p class="contact-panel__eyebrow">Contact Channels</p>
				<h2>Where to send what</h2>
				<ul class="contact-panel__list">
					<li
						v-for="channel in store.contact.channels"
						:key="channel.label"
					>
						<strong>{{ channel.label }}</strong>
						<a
							:href="channel.href"
							rel="noreferrer"
							target="_blank"
						>
							{{ channel.value }}
						</a>
						<p>{{ channel.note }}</p>
					</li>
				</ul>
			</article>

			<article class="contact-panel contact-panel--warm">
				<p class="contact-panel__eyebrow">Best Uses</p>
				<h2>Good reasons to reach out</h2>
				<ul class="contact-panel__tags">
					<li
						v-for="inquiry in store.contact.inquiryTypes"
						:key="inquiry"
					>
						{{ inquiry }}
					</li>
				</ul>
			</article>
		</section>

		<section class="contact-page__grid">
			<form class="contact-form" @submit.prevent="handleSubmit">
				<p class="contact-panel__eyebrow">Message Draft</p>
				<h2>Send a clean brief</h2>
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
					placeholder="Tell the studio what you need, your timeline, and any links or references."
					required
					rows="7"
				/>

				<button type="submit">Open email draft</button>

				<p v-if="responseMessage" class="contact-form__response">
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
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.contact-panel,
.contact-form {
	display: grid;
	gap: 1rem;
	padding: clamp(1.4rem, 4vw, 2rem);
	border-radius: 24px;
	background: rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.contact-panel--warm {
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.2),
			transparent 28%
		),
		rgba(255, 255, 255, 0.04);
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
	letter-spacing: 0.16em;
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
	border-radius: 18px;
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
	border-radius: 18px;
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
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.14);
	background: rgba(10, 18, 31, 0.5);
	color: #eff4ff;
}

.contact-form button {
	justify-self: start;
	border: none;
	border-radius: 999px;
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
