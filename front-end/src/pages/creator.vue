<script setup lang="ts">
import { toAbsoluteSiteUrl } from "@/lib/siteAssets";

useHead({
	title: "Tyler Morgan | RetroZetro Comics",
	link: [{ rel: "canonical", href: toAbsoluteSiteUrl("/creator") }],
	meta: [
		{
			name: "description",
			content: "Meet Tyler Morgan, creator of the stories and hand-drawn characters of RetroZetro Comics."
		}
	]
});
</script>

<template>
	<article class="reading-page">
		<header>
			<p class="reading-eyebrow">The creator</p>
			<h1>Tyler Morgan</h1>
			<p>Stories, characters, and hand-drawn worlds.</p>
		</header>
		<figure>
			<ResolvedImage
				alt="Tyler Morgan's hand-drawn designs for Exo, Shaman, and Fazo."
				:candidates="['/uploads/content/tyler-handdrawn-v1/011-18208a4722f52548.jpg']"
			/>
			<figcaption>Exo, Shaman, and Fazo, drawn by Tyler Morgan.</figcaption>
		</figure>
		<section>
			<h2>A universe built through drawing</h2>
			<p>
				Tyler Morgan creates the stories and original artwork of RetroZetro Comics. His characters include Exo
				Dexus, Fazo, Shaman, and Zetro. Alongside them are alien peoples, councils, outlaw crews, robot bodies,
				and machines built for distant battlefields.
			</p>
			<p>
				Drawing is part of how these characters develop. Exo's earlier design had short horns; a later design
				introduced antennae. Fazo has both original and alternate-universe designs. The artwork collection
				brings together 85 hand-drawn works, including individual portraits, groups, armor, and studies of the
				same character across different designs.
			</p>
		</section>
		<section>
			<h2>Find your way into the work</h2>
			<p>
				Start with <RouterLink to="/stories/the-list">The List</RouterLink>, where Exo searches an Apex Army
				moon base for his mother. In <RouterLink to="/stories/fall-of-a-dream">The Fall of a Dream</RouterLink>,
				a compromised army splits and an investigation turns toward an impostor. The
				<RouterLink to="/artwork">artwork collection</RouterLink> gives you another way in, through the
				characters and machines themselves.
			</p>
			<p>
				For questions about the work or collaboration,
				<RouterLink to="/contact">contact RetroZetro</RouterLink>.
			</p>
		</section>
	</article>
</template>
