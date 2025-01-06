<script lang="ts" setup>

</script>

<template>
	<nav class="flex-container">
		<!-- Ad Placement -->
		<div id="side-ad" class="mx-10">
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</nav>
</template>

<style scoped>
.flex-container {
	display: flex;
	align-items: center;
}

#side-ad {
	width: 150px; /* Specify the desired width */
	display: flex;
	justify-content: flex-end; /* Aligns the ad content to the right */
	align-items: center; /* Centers the ad content vertically */
	background-color: #f0f0f0;
	height: 100%;
}

nav {
	margin: 20px 0;
	padding: 10px 0;
}

@media (max-width: 768px) {
	/* Responsive adjustments if needed */
	.flex-container {
		flex-direction: column;
		align-items: stretch;
	}

	#side-ad {
		width: 100%;
		justify-content: center; /* Adjust alignment for smaller screens */
		height: auto; /* Allow height to adjust based on content */
		padding: 10px 0; /* Add padding for better spacing */
	}
}
</style>
