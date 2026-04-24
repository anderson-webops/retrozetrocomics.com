<script lang="ts" setup>
import type {
	AuditLogCategory,
	AuditLogRecord,
	DashboardData
} from "@/types/site";
import { computed, onMounted, reactive, ref } from "vue";

import { fetchAuditLogs, fetchDashboard } from "@/lib/siteApi";

type CategoryFilter = AuditLogCategory | "all";

const dashboard = ref<DashboardData | null>(null);
const auditLogs = ref<AuditLogRecord[]>([]);
const actionOptions = ref<string[]>([]);
const dashboardError = ref("");
const auditError = ref("");
const dashboardLoading = ref(false);
const auditLoading = ref(false);
const storageDialogOpen = ref(false);

const filters = reactive({
	action: "",
	actorRole: "all" as "admin" | "all",
	category: "all" as CategoryFilter,
	limit: 60,
	search: ""
});

const categoryOptions: Array<{ label: string; value: CategoryFilter }> = [
	{ label: "All activity", value: "all" },
	{ label: "Auth", value: "auth" },
	{ label: "Site content", value: "site-content" }
];

const metricCards = computed(() => [
	{
		label: "Characters",
		value: dashboard.value?.metrics.characterCount ?? 0
	},
	{
		label: "World Notes",
		value: dashboard.value?.metrics.worldEntryCount ?? 0
	},
	{
		label: "Story Files",
		value: dashboard.value?.metrics.storyArcCount ?? 0
	}
]);

const storageRows = computed(() => {
	const storage = dashboard.value?.storage;
	if (!storage) {
		return [];
	}

	return [
		["Active driver", storage.activeWriteDriver],
		["S3 configured", storage.s3Configured ? "Yes" : "No"],
		["S3 bucket", storage.s3Bucket || "Not set"],
		["S3 region", storage.s3Region || "Not set"],
		["S3 public base", storage.s3PublicBaseUrl || "Not set"],
		["Local public base", storage.localPublicBaseUrl || "Not set"],
		["Key prefix", storage.keyPrefix || "Not set"],
		[
			"Provider routing",
			storage.providerRoutingReady ? "Ready" : "Not ready"
		],
		["Switch ready", storage.switchReady ? "Ready" : "Not ready"]
	] satisfies Array<[string, string]>;
});

async function loadDashboard() {
	dashboardLoading.value = true;
	dashboardError.value = "";
	try {
		dashboard.value = await fetchDashboard();
	} catch (error: any) {
		dashboardError.value =
			error?.response?.data?.message ||
			error?.message ||
			"Unable to load admin data.";
	} finally {
		dashboardLoading.value = false;
	}
}

async function loadAuditLogs() {
	auditLoading.value = true;
	auditError.value = "";
	try {
		const data = await fetchAuditLogs(filters);
		auditLogs.value = data.logs;
		actionOptions.value = data.actionOptions;
	} catch (error: any) {
		auditError.value =
			error?.response?.data?.message ||
			error?.message ||
			"Unable to load activity.";
	} finally {
		auditLoading.value = false;
	}
}

async function refreshAll() {
	await Promise.all([loadDashboard(), loadAuditLogs()]);
}

function resetFilters() {
	filters.action = "";
	filters.actorRole = "all";
	filters.category = "all";
	filters.limit = 60;
	filters.search = "";
	void loadAuditLogs();
}

function formatDate(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short"
	}).format(date);
}

function formatCategory(category: AuditLogCategory) {
	return category === "site-content" ? "Site content" : "Auth";
}

onMounted(() => {
	void refreshAll();
});
</script>

<template>
	<section class="admin-dashboard">
		<header class="admin-dashboard__hero">
			<div>
				<p class="admin-dashboard__eyebrow">Owner Console</p>
				<h1>Site content tools</h1>
				<p>
					Editable public pages, owner activity, and storage
					readiness.
				</p>
			</div>

			<div class="admin-dashboard__actions">
				<RouterLink
					class="admin-dashboard__button admin-dashboard__button--primary"
					:to="{ path: '/characters', query: { manage: '1' } }"
				>
					Edit Characters
				</RouterLink>
				<RouterLink
					class="admin-dashboard__button"
					:to="{ path: '/about', query: { manage: '1' } }"
				>
					Edit Story Files
				</RouterLink>
				<button
					class="admin-dashboard__button admin-dashboard__button--ghost"
					:disabled="dashboardLoading || auditLoading"
					type="button"
					@click="refreshAll"
				>
					{{
						dashboardLoading || auditLoading
							? "Refreshing..."
							: "Refresh"
					}}
				</button>
			</div>
		</header>

		<p
			v-if="dashboardError"
			class="admin-dashboard__status admin-dashboard__status--error"
		>
			{{ dashboardError }}
		</p>

		<div class="admin-dashboard__metrics" aria-label="Content totals">
			<article
				v-for="metric in metricCards"
				:key="metric.label"
				class="metric-card"
			>
				<p>{{ metric.label }}</p>
				<strong>{{ dashboardLoading ? "-" : metric.value }}</strong>
			</article>
		</div>

		<div class="admin-dashboard__grid">
			<article class="admin-panel admin-panel--content">
				<div class="admin-panel__heading">
					<p>Editable Pages</p>
					<h2>Public content</h2>
				</div>

				<div class="content-links">
					<RouterLink
						class="content-link"
						:to="{ path: '/characters', query: { manage: '1' } }"
					>
						<span>
							<strong>Characters and factions</strong>
							<small
								>Character cards, hero copy, and world
								notes.</small
							>
						</span>
						<span aria-hidden="true">Open</span>
					</RouterLink>

					<RouterLink
						class="content-link"
						:to="{ path: '/about', query: { manage: '1' } }"
					>
						<span>
							<strong>About story files</strong>
							<small>Story arc summaries and plot beats.</small>
						</span>
						<span aria-hidden="true">Open</span>
					</RouterLink>
				</div>
			</article>

			<article class="admin-panel admin-panel--storage">
				<div class="admin-panel__heading">
					<p>Storage</p>
					<h2>Asset writes</h2>
				</div>

				<p class="storage-summary">
					{{
						dashboard?.storage.switchSummary ||
						"Storage status is loading."
					}}
				</p>

				<button
					class="admin-dashboard__button admin-dashboard__button--ghost"
					type="button"
					@click="storageDialogOpen = true"
				>
					View Details
				</button>
			</article>
		</div>

		<article class="admin-panel admin-panel--wide">
			<div class="admin-panel__heading admin-panel__heading--split">
				<div>
					<p>Activity</p>
					<h2>Owner audit log</h2>
				</div>
				<button
					class="admin-dashboard__button admin-dashboard__button--ghost"
					type="button"
					@click="resetFilters"
				>
					Reset Filters
				</button>
			</div>

			<form class="audit-filters" @submit.prevent="loadAuditLogs">
				<label>
					<span>Search</span>
					<input
						v-model="filters.search"
						placeholder="Actor, target, or summary"
						type="search"
					/>
				</label>

				<label>
					<span>Category</span>
					<select v-model="filters.category">
						<option
							v-for="option in categoryOptions"
							:key="option.value"
							:value="option.value"
						>
							{{ option.label }}
						</option>
					</select>
				</label>

				<label>
					<span>Action</span>
					<select v-model="filters.action">
						<option value="">All actions</option>
						<option
							v-for="action in actionOptions"
							:key="action"
							:value="action"
						>
							{{ action }}
						</option>
					</select>
				</label>

				<label>
					<span>Limit</span>
					<select v-model.number="filters.limit">
						<option :value="30">30</option>
						<option :value="60">60</option>
						<option :value="120">120</option>
						<option :value="200">200</option>
					</select>
				</label>

				<button
					class="admin-dashboard__button admin-dashboard__button--primary"
					:disabled="auditLoading"
					type="submit"
				>
					{{ auditLoading ? "Loading..." : "Apply" }}
				</button>
			</form>

			<p
				v-if="auditError"
				class="admin-dashboard__status admin-dashboard__status--error"
			>
				{{ auditError }}
			</p>

			<div v-if="auditLoading" class="audit-empty">
				Loading activity...
			</div>
			<div v-else-if="!auditLogs.length" class="audit-empty">
				No matching activity yet.
			</div>
			<ol v-else class="audit-list">
				<li v-for="log in auditLogs" :key="log.id" class="audit-item">
					<div class="audit-item__main">
						<span class="audit-item__category">
							{{ formatCategory(log.category) }}
						</span>
						<strong>{{ log.summary || log.action }}</strong>
						<p>
							{{ log.actorName || log.actorEmail || "Admin" }}
							<span aria-hidden="true">/</span>
							{{ formatDate(log.createdAt) }}
						</p>
					</div>
					<div class="audit-item__meta">
						<span>{{ log.action }}</span>
						<span>{{ log.outcome }}</span>
					</div>
				</li>
			</ol>
		</article>

		<Teleport to="body">
			<div
				v-if="storageDialogOpen"
				class="storage-dialog"
				role="presentation"
				@click.self="storageDialogOpen = false"
			>
				<section
					aria-labelledby="storage-dialog-heading"
					aria-modal="true"
					class="storage-dialog__panel"
					role="dialog"
				>
					<button
						aria-label="Close storage details"
						class="storage-dialog__close"
						type="button"
						@click="storageDialogOpen = false"
					>
						&times;
					</button>

					<p class="admin-dashboard__eyebrow">Storage Details</p>
					<h2 id="storage-dialog-heading">Asset infrastructure</h2>
					<p>
						Deployment details for future asset infrastructure work.
					</p>

					<dl class="storage-dialog__list">
						<div v-for="[label, value] in storageRows" :key="label">
							<dt>{{ label }}</dt>
							<dd>{{ value }}</dd>
						</div>
					</dl>

					<p
						v-if="dashboard?.storage.nextStep"
						class="storage-dialog__next"
					>
						{{ dashboard.storage.nextStep }}
					</p>
				</section>
			</div>
		</Teleport>
	</section>
</template>

<style scoped>
.admin-dashboard {
	display: grid;
	gap: clamp(1.1rem, 3vw, 1.6rem);
}

.admin-dashboard__hero,
.admin-panel,
.metric-card {
	border: 1px solid rgba(255, 255, 255, 0.1);
	background: rgba(255, 255, 255, 0.06);
	box-shadow: 0 22px 58px rgba(0, 0, 0, 0.24);
}

.admin-dashboard__hero {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 1.25rem;
	align-items: end;
	padding: clamp(1.4rem, 4vw, 2.35rem);
	border-radius: var(--radius-shell);
}

.admin-dashboard__hero h1,
.admin-dashboard__hero p,
.admin-panel h2,
.admin-panel p,
.metric-card p {
	margin: 0;
}

.admin-dashboard__hero h1 {
	color: #fff1df;
	font-size: clamp(2rem, 5vw, 3.2rem);
}

.admin-dashboard__hero > div:first-child {
	display: grid;
	gap: 0.65rem;
}

.admin-dashboard__hero > div:first-child > p:last-child {
	max-width: 68ch;
	color: rgba(255, 255, 255, 0.74);
	line-height: 1.7;
}

.admin-dashboard__eyebrow,
.admin-panel__heading > p {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: var(--tracking-eyebrow);
	text-transform: uppercase;
}

.admin-dashboard__actions {
	display: flex;
	flex-wrap: wrap;
	justify-content: flex-end;
	gap: 0.7rem;
}

.admin-dashboard__button {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-height: 2.7rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-pill);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font: inherit;
	font-size: 0.82rem;
	font-weight: 900;
	padding: 0.7rem 1rem;
	text-decoration: none;
}

.admin-dashboard__button--primary {
	border-color: transparent;
	background: #ff914d;
	color: #160021;
}

.admin-dashboard__button--ghost {
	background: rgba(255, 255, 255, 0.04);
}

.admin-dashboard__button:disabled {
	cursor: wait;
	opacity: 0.64;
}

.admin-dashboard__status {
	margin: 0;
	border-radius: var(--radius-control);
	padding: 0.85rem 1rem;
}

.admin-dashboard__status--error {
	border: 1px solid rgba(255, 145, 77, 0.32);
	background: rgba(255, 145, 77, 0.12);
	color: #ffd2ae;
}

.admin-dashboard__metrics,
.admin-dashboard__grid {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 1rem;
}

.metric-card {
	display: grid;
	gap: 0.5rem;
	border-radius: var(--radius-panel);
	padding: 1.1rem;
}

.metric-card p {
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.78rem;
	font-weight: 850;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.metric-card strong {
	color: #fff1df;
	font-size: clamp(2rem, 5vw, 3rem);
	line-height: 1;
}

.admin-panel {
	display: grid;
	gap: 1rem;
	border-radius: var(--radius-panel);
	padding: clamp(1.1rem, 3vw, 1.45rem);
}

.admin-panel--content {
	grid-column: span 2;
}

.admin-panel--wide {
	gap: 1.2rem;
}

.admin-panel__heading {
	display: grid;
	gap: 0.35rem;
}

.admin-panel__heading h2 {
	color: #fff1df;
	font-size: clamp(1.25rem, 3vw, 1.65rem);
}

.admin-panel__heading--split {
	grid-template-columns: minmax(0, 1fr) auto;
	align-items: start;
}

.content-links {
	display: grid;
	gap: 0.75rem;
}

.content-link {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 1rem;
	align-items: center;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.05);
	color: #fff8ef;
	padding: 1rem;
	text-decoration: none;
}

.content-link span:first-child {
	display: grid;
	gap: 0.25rem;
}

.content-link strong {
	color: #fff1df;
}

.content-link small,
.storage-summary {
	color: rgba(255, 255, 255, 0.68);
	line-height: 1.6;
}

.content-link span:last-child {
	color: #ffb36f;
	font-size: 0.76rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.storage-summary {
	max-width: 52ch;
}

.audit-filters {
	display: grid;
	grid-template-columns:
		minmax(12rem, 1fr) repeat(3, minmax(9rem, 0.45fr))
		auto;
	gap: 0.75rem;
	align-items: end;
}

.audit-filters label {
	display: grid;
	gap: 0.4rem;
	color: rgba(255, 255, 255, 0.7);
	font-size: 0.75rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.audit-filters input,
.audit-filters select {
	width: 100%;
	min-height: 2.7rem;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	font: inherit;
	padding: 0.68rem 0.75rem;
}

.audit-empty {
	border: 1px dashed rgba(255, 255, 255, 0.16);
	border-radius: var(--radius-control);
	color: rgba(255, 255, 255, 0.66);
	padding: 1rem;
	text-align: center;
}

.audit-list {
	display: grid;
	gap: 0.72rem;
	list-style: none;
	margin: 0;
	padding: 0;
}

.audit-item {
	display: grid;
	grid-template-columns: minmax(0, 1fr) auto;
	gap: 1rem;
	align-items: center;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
	background: rgba(255, 255, 255, 0.045);
	padding: 0.9rem 1rem;
}

.audit-item__main {
	display: grid;
	gap: 0.3rem;
	min-width: 0;
}

.audit-item__main strong,
.audit-item__main p {
	margin: 0;
}

.audit-item__main strong {
	color: #fff1df;
}

.audit-item__main p,
.audit-item__meta {
	color: rgba(255, 255, 255, 0.62);
	font-size: 0.85rem;
}

.audit-item__category {
	justify-self: start;
	border: 1px solid rgba(255, 179, 111, 0.24);
	border-radius: 999px;
	color: #ffb36f;
	font-size: 0.68rem;
	font-weight: 900;
	letter-spacing: 0.08em;
	padding: 0.22rem 0.5rem;
	text-transform: uppercase;
}

.audit-item__meta {
	display: grid;
	justify-items: end;
	gap: 0.3rem;
	font-weight: 800;
	text-transform: uppercase;
}

.storage-dialog {
	position: fixed;
	inset: 0;
	z-index: 110;
	display: grid;
	place-items: center;
	padding: 1rem;
	background: rgba(4, 8, 16, 0.72);
	backdrop-filter: blur(14px);
}

.storage-dialog__panel {
	position: relative;
	display: grid;
	gap: 0.9rem;
	width: min(100%, 42rem);
	max-height: min(90vh, 48rem);
	overflow: auto;
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: var(--radius-panel);
	background: #101a2a;
	color: #fff8ef;
	padding: clamp(1.35rem, 4vw, 2rem);
}

.storage-dialog__panel h2,
.storage-dialog__panel p {
	margin: 0;
}

.storage-dialog__panel > p:not(.admin-dashboard__eyebrow) {
	color: rgba(255, 255, 255, 0.72);
	line-height: 1.65;
}

.storage-dialog__close {
	position: absolute;
	top: 0.75rem;
	right: 0.75rem;
	display: grid;
	width: 2.2rem;
	height: 2.2rem;
	place-items: center;
	border: 1px solid rgba(255, 255, 255, 0.16);
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.08);
	color: #fff8ef;
	cursor: pointer;
	font-size: 1.3rem;
	line-height: 1;
}

.storage-dialog__list {
	display: grid;
	gap: 0;
	margin: 0;
	overflow: hidden;
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: var(--radius-control);
}

.storage-dialog__list div {
	display: grid;
	grid-template-columns: minmax(10rem, 0.45fr) minmax(0, 1fr);
	gap: 1rem;
	padding: 0.72rem 0.85rem;
}

.storage-dialog__list div + div {
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.storage-dialog__list dt {
	color: rgba(255, 255, 255, 0.62);
	font-weight: 850;
}

.storage-dialog__list dd {
	margin: 0;
	overflow-wrap: anywhere;
}

.storage-dialog__next {
	border: 1px solid rgba(255, 179, 111, 0.24);
	border-radius: var(--radius-control);
	background: rgba(255, 179, 111, 0.08);
	padding: 0.85rem 1rem;
}

@media (max-width: 980px) {
	.admin-dashboard__hero,
	.admin-panel__heading--split,
	.audit-item {
		grid-template-columns: 1fr;
	}

	.admin-dashboard__actions,
	.audit-item__meta {
		justify-content: start;
		justify-items: start;
	}

	.admin-dashboard__metrics,
	.admin-dashboard__grid,
	.audit-filters {
		grid-template-columns: 1fr;
	}

	.admin-panel--content {
		grid-column: auto;
	}
}

@media (max-width: 620px) {
	.content-link,
	.storage-dialog__list div {
		grid-template-columns: 1fr;
	}

	.admin-dashboard__actions,
	.admin-dashboard__button {
		width: 100%;
	}
}
</style>
