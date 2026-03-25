<template>
	<section class="not-found-copy">
		<p class="not-found-copy__eyebrow">Signal Lost</p>
		<h1>That page drifted off the map.</h1>
		<p>
			Try the studio archive, return to the homepage, or jump back to the
			last page you were reading.
		</p>
	</section>
</template>

<style scoped>
.not-found-copy {
	display: grid;
	gap: 0.8rem;
	justify-items: center;
}

.not-found-copy h1,
.not-found-copy p {
	margin: 0;
}

.not-found-copy h1 {
	color: #fff4e7;
	font-size: clamp(2rem, 6vw, 3.4rem);
	line-height: 0.98;
}

.not-found-copy p:last-child {
	max-width: 38ch;
	color: rgba(239, 244, 255, 0.78);
	line-height: 1.8;
}

.not-found-copy__eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.22em;
	font-size: 0.78rem;
	font-weight: 800;
	color: #ffd27d;
}
</style>

<route lang="yaml">
meta:
layout: 404
</route>
