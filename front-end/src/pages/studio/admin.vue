<script lang="ts" setup>
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();

useHead({
	meta: [
		{
			name: "robots",
			content: "noindex,nofollow"
		}
	]
});

onMounted(() => {
	void session.bootstrapSession();
});
</script>

<template>
	<div v-if="session.isAdmin">
		<AdminDashboard />
	</div>
	<section v-else class="admin-gate">
		<p class="admin-gate__eyebrow">Restricted</p>
		<h1>Admin access required</h1>
		<p>
			Only the site owner or another admin account can open the content
			console.
		</p>
		<button type="button" @click="session.openAuth()">
			Sign in as admin
		</button>
	</section>
</template>

<style scoped>
.admin-gate {
	display: grid;
	gap: 0.9rem;
	padding: clamp(1.6rem, 3vw, 2.25rem);
	border-radius: var(--radius-panel);
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.08);
}

.admin-gate h1,
.admin-gate p {
	margin: 0;
}

.admin-gate h1 {
	color: #fff1df;
}

.admin-gate p {
	color: rgba(255, 255, 255, 0.76);
	line-height: 1.7;
	max-width: 58ch;
}

.admin-gate__eyebrow {
	text-transform: uppercase;
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.78rem;
	color: #ffb36f;
}

.admin-gate button {
	justify-self: start;
	margin-top: 0.9rem;
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.7rem 1rem;
	background: #ff914d;
	color: #160021;
	font-weight: 800;
	cursor: pointer;
}
</style>

<route lang="yaml">
meta:
    layout: default
</route>
