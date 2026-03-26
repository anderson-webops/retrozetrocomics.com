<script lang="ts" setup>
import type { CharacterBoardProfile } from "@/types/site";
import { computed } from "vue";
import { createDefaultCharactersPageContent } from "@/content/defaultCharactersPageContent";
import { useSessionStore } from "@/stores/session";

const props = defineProps<{
	items?: CharacterBoardProfile[];
}>();

const fallbackCharacters = createDefaultCharactersPageContent().characters;
const characters = computed(() => props.items ?? fallbackCharacters);
const session = useSessionStore();

function isDefinedImageCandidate(
	candidate: string | undefined
): candidate is string {
	return Boolean(candidate);
}

function definedImageCandidates(candidates: (string | undefined)[]) {
	return candidates.filter(isDefinedImageCandidate);
}
</script>

<template>
	<section class="characters-grid">
		<div class="characters-grid__items">
			<div
				v-for="item in characters"
				:key="item.id"
				class="characters-grid__card"
			>
				<RouterLink
					v-if="session.showAdminTools"
					class="characters-grid__edit"
					:to="{
						path: '/studio/admin',
						query: { manage: '1', section: 'board' }
					}"
				>
					Edit
				</RouterLink>
				<div class="characters-grid__media">
					<ResolvedImage
						:alt="item.imgAlt"
						:candidates="
							definedImageCandidates([
								item.image,
								item.fallbackImage
							])
						"
						class="characters-grid__image"
					/>
				</div>
				<div class="characters-grid__copy">
					<p class="characters-grid__role">{{ item.role }}</p>
					<h3>{{ item.name }}</h3>
					<p class="characters-grid__description">
						{{ item.description }}
					</p>
					<div class="characters-grid__chips">
						<span>{{ item.specialty }}</span>
						<span>{{ item.frequency }}</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style scoped>
.characters-grid {
	display: grid;
	gap: 1.2rem;
}

.characters-grid__items {
	display: grid;
	gap: 1rem;
	grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.characters-grid__card {
	position: relative;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	height: 100%;
	padding: 1rem;
	padding-top: 4.5rem;
	border-radius: 24px;
	background:
		radial-gradient(
			circle at top right,
			rgba(255, 148, 89, 0.18),
			transparent 26%
		),
		rgba(255, 255, 255, 0.05);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 22px 40px rgba(8, 13, 26, 0.16);
}

.characters-grid__edit {
	position: absolute;
	top: 1rem;
	right: 1rem;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 4.5rem;
	height: 2.5rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.12);
	border: 1px solid rgba(124, 225, 246, 0.2);
	color: #dff9ff;
	font-weight: 800;
	font-size: 0.82rem;
	text-decoration: none;
}

.characters-grid__media {
	flex: 1 1 17rem;
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 17rem;
	border-radius: 22px;
	background: rgba(255, 255, 255, 0.015);
}

.characters-grid__image {
	width: 100%;
	max-height: 18rem;
	height: auto;
	display: block;
	border-radius: 20px;
	background: #08111f;
}

.characters-grid__copy {
	display: grid;
	gap: 0.6rem;
	align-content: start;
}

.characters-grid__role,
.characters-grid__description,
.characters-grid__copy h3 {
	margin: 0;
}

.characters-grid__role {
	text-transform: uppercase;
	letter-spacing: 0.16em;
	font-size: 0.78rem;
	font-weight: 700;
	color: #ffd27d;
}

.characters-grid__copy h3 {
	font-size: 1.6rem;
	color: #fff4e7;
}

.characters-grid__description {
	line-height: 1.75;
	color: rgba(239, 244, 255, 0.76);
}

.characters-grid__chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
}

.characters-grid__chips span {
	padding: 0.5rem 0.8rem;
	border-radius: 999px;
	background: rgba(124, 225, 246, 0.1);
	color: #7ce1f6;
	font-size: 0.82rem;
	line-height: 1.4;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
