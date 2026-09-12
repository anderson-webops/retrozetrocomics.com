<script setup lang="ts">
import { useAboutPageContent } from "@/composables/useAboutPageContent";
import { useReadingPlace } from "@/composables/useReadingPlace";
import { resolveReadingPlace } from "@/lib/readerDiscovery";

const { content, load } = useAboutPageContent();
const { place, error, clear } = useReadingPlace();
const destination = computed(() => resolveReadingPlace(content.value.storyArcs, place.value));
onMounted(() => void load());
</script>

<template>
	<aside v-if="place" class="continue-reading" aria-label="Your saved reading place">
		<div v-if="destination">
			<p>Continue reading</p>
			<RouterLink :to="destination.url"
				>{{ destination.title }}<span v-if="destination.section">: {{ destination.section }}</span></RouterLink
			>
		</div>
		<p v-else>Your saved story is no longer on the public site.</p>
		<button type="button" @click="clear">Forget saved place</button>
		<p v-if="error" role="status">{{ error }}</p>
	</aside>
</template>

<style scoped>
.continue-reading {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	padding: 1rem 1.3rem;
	background: var(--surface-deep-raised);
	border: 1px solid rgba(255, 210, 125, 0.2);
	border-radius: var(--radius-card);
}
.continue-reading p {
	margin: 0;
	color: var(--ink-on-deep-muted);
}
.continue-reading a {
	color: var(--accent-gold);
	overflow-wrap: anywhere;
}
.continue-reading button {
	padding: 0.65rem;
	border: 1px solid rgba(255, 255, 255, 0.2);
	border-radius: var(--radius-control);
	background: transparent;
	color: var(--ink-on-deep);
}
</style>
