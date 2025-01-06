<script lang="ts" setup>
const props = withDefaults(defineProps<{
	name?: string;
	message?: string;
}>(), {
	name: "Home",
});
</script>

<template>
	<div class="page">
		<div class="item">
			<h1>RetroZetro Comics</h1> <!-- props.header -->
			<p>{{ props.message }}</p>
		</div>
	</div>
</template>

<style scoped>

</style>
