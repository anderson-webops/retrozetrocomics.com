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
		<!--		<img -->
		<!--			v-if="$route.path !== '/'" alt="RetroZetro Comics Logo" class="logo" -->
		<!--			src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png" -->
		<!--		> -->
		<div class="item">
			<h1>RetroZetro Comics</h1> <!-- props.header -->
			<p>{{ props.message }}</p>
		</div>
	</div>
</template>

<style scoped>
/*.logo {
	display: block;
	width: 150px; !* Adjust size as needed *!
	height: auto;
	margin: 0 auto 20px;
}*/
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>

<!-- <route lang="yaml"> -->
<!-- meta: -->
<!-- layout: default -->
<!-- </route> -->
