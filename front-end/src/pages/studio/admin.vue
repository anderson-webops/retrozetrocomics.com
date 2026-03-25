<script lang="ts" setup>
import { useSessionStore } from "@/stores/session";

const session = useSessionStore();

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
			Only the site owner or another admin account can open the publishing
			console.
		</p>
		<button type="button" @click="session.openAuth('login')">
			Sign in as admin
		</button>
	</section>
</template>

<style scoped>
.admin-gate {
	display: grid;
	gap: 0.8rem;
	padding: clamp(1.8rem, 4vw, 2.6rem);
	border-radius: 24px;
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
	letter-spacing: 0.24em;
	font-size: 0.78rem;
	color: #ffb36f;
}

.admin-gate button {
	justify-self: start;
	border: none;
	border-radius: 999px;
	padding: 0.78rem 1.1rem;
	background: linear-gradient(120deg, #ff914d, #7a4bb4);
	color: #160021;
	font-weight: 800;
	cursor: pointer;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
