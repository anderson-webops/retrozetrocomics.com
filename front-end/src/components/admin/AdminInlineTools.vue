<script lang="ts" setup>
import type { RouteLocationRaw } from "vue-router";

import { useSessionStore } from "@/stores/session";

interface AdminInlineAction {
	href?: string;
	label: string;
	onClick?: () => void;
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
const isOpen = ref(false);
</script>

<template>
	<section v-if="session.showAdminTools" class="admin-inline-tools">
		<div class="admin-inline-tools__header">
			<div class="admin-inline-tools__copy">
				<p class="admin-inline-tools__eyebrow">Admin</p>
				<h2>{{ props.title }}</h2>
				<p>{{ props.description }}</p>
			</div>
			<button
				type="button"
				class="admin-inline-tools__toggle"
				@click="isOpen = !isOpen"
			>
				{{ isOpen ? "Hide controls" : "Open controls" }}
			</button>
		</div>
		<div v-if="isOpen" class="admin-inline-tools__actions">
			<template v-for="action in props.actions" :key="action.label">
				<RouterLink
					v-if="action.to"
					class="admin-inline-tools__action"
					:class="`admin-inline-tools__action--${action.tone || 'primary'}`"
					:to="action.to"
				>
					{{ action.label }}
				</RouterLink>
				<button
					v-else-if="action.onClick"
					type="button"
					class="admin-inline-tools__action"
					:class="`admin-inline-tools__action--${action.tone || 'primary'}`"
					@click="action.onClick"
				>
					{{ action.label }}
				</button>
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
	gap: 0.7rem;
	padding: 0.85rem 1rem;
	border-radius: var(--radius-panel);
	background: rgba(124, 225, 246, 0.08);
	border: 1px solid rgba(124, 225, 246, 0.18);
}

.admin-inline-tools__header {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	align-items: center;
	justify-content: space-between;
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
	letter-spacing: var(--tracking-eyebrow);
	font-size: 0.74rem;
	font-weight: 800;
	color: #7ce1f6;
}

.admin-inline-tools__toggle,
.admin-inline-tools__actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
}

.admin-inline-tools__toggle {
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: var(--radius-pill);
	padding: 0.62rem 0.9rem;
	background: rgba(255, 255, 255, 0.08);
	color: #fff2df;
	font-weight: 800;
	cursor: pointer;
}

.admin-inline-tools__action {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.62rem 0.9rem;
	border-radius: var(--radius-pill);
	text-decoration: none;
	font-weight: 800;
	border: none;
	cursor: pointer;
}

.admin-inline-tools__action--primary {
	background: #ffd27d;
	color: #08111f;
}

.admin-inline-tools__action--ghost {
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.12);
	color: #fff2df;
}
</style>
