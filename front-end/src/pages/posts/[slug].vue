<script lang="ts" setup>
import type { PostDetailResponse } from "@/types/site";

import { fetchPost } from "@/lib/siteApi";

const route = useRoute("/posts/[slug]");

const detail = ref<PostDetailResponse | null>(null);
const error = ref("");
const loading = ref(false);

const post = computed(() => detail.value?.post || null);

async function loadPost() {
	const slug = String(route.params.slug || "");
	if (!slug) {
		return;
	}

	loading.value = true;
	error.value = "";

	try {
		detail.value = await fetchPost(slug);
	} catch (loadError: any) {
		error.value =
			loadError?.response?.data?.message ||
			loadError?.message ||
			"Unable to load this post.";
	} finally {
		loading.value = false;
	}
}

onMounted(() => {
	void loadPost();
});

watch(
	() => route.params.slug,
	() => {
		void loadPost();
	}
);
</script>

<template>
	<div class="post-page">
		<p v-if="loading" class="post-page__state">Loading post...</p>
		<p v-else-if="error" class="post-page__state post-page__state--error">
			{{ error }}
		</p>

		<template v-else-if="post && detail">
			<AdminInlineTools
				:actions="[
					{
						label: 'Edit this post',
						to: {
							path: '/studio/admin',
							query: {
								manage: '1',
								section: 'posts',
								slug: post.slug
							}
						}
					},
					{
						label: 'Add another post',
						tone: 'ghost',
						to: {
							path: '/studio/admin',
							query: {
								intent: 'new',
								manage: '1',
								section: 'posts',
								type: post.type
							}
						}
					}
				]"
				description="Jump from the live post directly into its publishing workspace."
				title="Post controls"
			/>
			<PostPreviewPanel back-to="/studio" :post="post" />

			<CommentPanel
				:comments="detail.comments"
				:comments-enabled="detail.commentsEnabled"
				:post-id="post.id"
				:viewer-can-comment="detail.viewerCanComment"
				@refreshed="loadPost"
			/>
		</template>
	</div>
</template>

<style scoped>
.post-page {
	display: grid;
	gap: 1.8rem;
}

.post-page__state {
	margin: 0;
	padding: 1rem 1.2rem;
	border-radius: 18px;
	background: var(--surface-panel);
	color: #42516b;
}

.post-page__state--error {
	color: #bf4b34;
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
