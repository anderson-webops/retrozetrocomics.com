<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

import { useSessionStore } from "@/stores/session";

interface AdminInlineAction {
	href?: string;
	label: string;
	tone?: "ghost" | "primary";
	to?: RouteLocationRaw;
}

const props = withDefaults(
	defineProps<{
		actions: AdminInlineAction[];
		description?: string;
		title?: string;
	}>(),
	{
		description: "Quick admin shortcuts for this part of the public site.",
		title: "Admin shortcuts"
	}
);

const session = useSessionStore();
</script>

<template>
	<section v-if="session.showAdminTools" class="admin-inline-tools">
		<div class="admin-inline-tools__copy">
			<p class="admin-inline-tools__eyebrow">Admin</p>
			<h2>{{ props.title }}</h2>
			<p>{{ props.description }}</p>
		</div>
		<div class="admin-inline-tools__actions">
			<template v-for="action in props.actions" :key="action.label">
				<RouterLink
					v-if="action.to"
					class="admin-inline-tools__action"
					:class="`admin-inline-tools__action--${action.tone || 'primary'}`"
					:to="action.to"
				>
					{{ action.label }}
				</RouterLink>
				<a
					v-else-if="action.href"
					class="admin-inline-tools__action"
					:class="`admin-inline-tools__action--${action.tone || 'primary'}`"
					:href="action.href"
				>
					{{ action.label }}
				</a>
			</template>
		</div>
	</section>
</template>

<style scoped>
.admin-inline-tools {
	display: grid;
	gap: 0.9rem;
	padding: 1rem 1.1rem;
	border-radius: 22px;
	background: rgba(124, 225, 246, 0.08);
	border: 1px solid rgba(124, 225, 246, 0.18);
}

.admin-inline-tools__copy {
	display: grid;
	gap: 0.35rem;
}

.admin-inline-tools__copy h2,
.admin-inline-tools__copy p {
	margin: 0;
}

.admin-inline-tools__copy h2 {
	font-size: 1.2rem;
	color: #fff4e7;
}

.admin-inline-tools__copy p {
	line-height: 1.7;
	color: rgba(239, 244, 255, 0.74);
}

.admin-inline-tools__eyebrow {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.18em;
	font-size: 0.74rem;
	font-weight: 800;
	color: #7ce1f6;
}

.admin-inline-tools__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.admin-inline-tools__action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.72rem 1rem;
	border-radius: 999px;
	text-decoration: none;
	font-weight: 800;
}

.admin-inline-tools__action--primary {
	background: linear-gradient(120deg, #ff914d, #ffd27d);
	color: #08111f;
}

.admin-inline-tools__action--ghost {
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.12);
	color: #fff2df;
}
</style>
