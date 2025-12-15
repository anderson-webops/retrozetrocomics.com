<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
	initial?: number;
}>();

const count = ref(props.initial ?? 0);

watch(
	() => props.initial,
	value => {
		// Keep the displayed value in sync if the prop changes.
		count.value = value ?? 0;
	}
);

function increment() {
	count.value += 1;
}

function decrement() {
	count.value -= 1;
}
</script>

<template>
	<div>
		{{ count }} <button class="inc" @click="increment">+</button
		><button class="dec" @click="decrement">-</button>
	</div>
</template>
