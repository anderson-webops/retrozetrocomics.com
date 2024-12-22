<script lang="ts" setup>

</script>

<template>
	<nav class="flex-container">
		<div class="logo-container">
			<RouterLink to="/">
				<img
					alt="RetroZetro Comics Logo"
					class="logo"
					src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
				>
			</RouterLink>
		</div>
		<!-- Ad Placement -->
		<div id="top-ad">
			<div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
		</div>
	</nav>
</template>

<style scoped>
.flex-container {
	display: flex;
	align-items: center;
}

.logo-container {
	/* Allow this container to take up the remaining space */
	flex: 1;
	display: flex;
	justify-content: center; /* Centers the logo horizontally within this container */
	align-items: center; /* Centers the logo vertically */
}

#top-ad {
	width: 70%; /* Specify the desired width */
	display: flex;
	justify-content: flex-end; /* Aligns the ad content to the right */
	align-items: center; /* Centers the ad content vertically */
	background-color: #f0f0f0;
	height: 100px;
}

.logo {
	width: 120px;
	height: auto;
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

	#top-ad {
		width: 100%;
		justify-content: center; /* Adjust alignment for smaller screens */
		height: auto; /* Allow height to adjust based on content */
		padding: 10px 0; /* Add padding for better spacing */
	}

	.logo-container {
		flex: none;
		width: 100%;
		justify-content: center;
		margin-bottom: 10px; /* Add spacing between logo and ad */
	}
}
</style>
