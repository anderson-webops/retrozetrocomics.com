<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const characters = computed(() => store.characters);
</script>

<template>
	<div class="page">
		<div class="items-container">
			<div
				v-for="(item, index) in characters.character"
				:key="index"
				class="item"
			>
				<h3>{{ item.name }}</h3>
				<img :alt="item.imgAlt" :src="item.image" class="item-image" />
				<p>{{ item.description }}</p>
			</div>
		</div>
	</div>
</template>

<style scoped>
.items-container {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-around; /* Centers the items and spaces them evenly */
	gap: 20px; /* Adjust the gap between items */
	width: 100%;
	max-width: 1200px; /* Adjust based on your preference */
	margin: 0 auto; /* Center the container */
}

.item {
	width: 100%;
	max-width: 350px; /* Set a maximum width for each item */
	background-color: #fff; /* White background */
	border: 1px solid #ff914d; /* Orange border */
	border-radius: 10px; /* Slightly more rounded corners */
	box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Slightly larger shadow for a subtle 3D effect */
	padding: 20px; /* Padding inside each item */
	text-align: center; /* Center text and images */
}

.item-image {
	width: 100%;
	height: auto;
	border-radius: 5px; /* Rounded corners for images */
	margin-bottom: 15px; /* Space between image and description */
}

.item h3 {
	font-size: 1.5rem;
	color: #603985; /* Lighter purple text */
	margin-bottom: 10px;
}

.item p {
	margin-top: 10px;
	font-size: 1rem;
	color: #603985; /* Lighter purple text */
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
