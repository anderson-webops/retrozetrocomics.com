<script lang="ts" setup>
import type { PropType } from "vue";

const props = defineProps({
	alt: {
		required: true,
		type: String
	},
	candidates: {
		required: true,
		type: Array as PropType<readonly string[]>
	}
});

const currentIndex = ref(0);

const normalizedCandidates = computed(() => [
	...new Set(props.candidates.filter(Boolean))
]);

const currentSrc = computed(
	() => normalizedCandidates.value[currentIndex.value] || ""
);

watch(
	normalizedCandidates,
	() => {
		currentIndex.value = 0;
	},
	{ deep: true }
);

function handleError() {
	if (currentIndex.value < normalizedCandidates.value.length - 1) {
		currentIndex.value += 1;
	}
}
</script>

<template>
	<img v-bind="$attrs" :alt="alt" :src="currentSrc" @error="handleError" />
</template>
