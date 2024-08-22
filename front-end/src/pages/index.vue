<script lang="ts" setup>
import About from "~/pages/about.vue";
import Projects from "~/pages/projects.vue";
import Experience from "~/pages/experience.vue";
</script>

<template>
	<div class="page">
		<About class="about" />
		<div class="projects-experience">
			<Projects class="projects" />
			<Experience class="experience" />
		</div>
	</div>
</template>

<style scoped>
.about {
	width: 100%;
}

.projects-experience {
	display: flex;
	flex-direction: row;
	width: 100%;
}

.projects,
.experience {
	width: 50%;
}

.projects {
	margin-right: 10px;
}

@media (max-width: 600px) {
	.projects-experience {
		flex-direction: column;
	}
	
	.projects,
	.experience {
		width: 100%;
		margin: 0;
	}
}
</style>

<!-- <script lang="ts" setup>
defineOptions({
  name: 'IndexPage',
})
const user = useUserStore()
const name = ref(user.savedName)

const router = useRouter()

function go() {
  if (name.value)
    router.push(`/hi/${encodeURIComponent(name.value)}`)
}

const { t } = useI18n()
</script>

<template>
  <div>
    <div text-4xl>
      <div i-carbon-campsite inline-block />
    </div>
    <p>
      <a href="https://github.com/antfu/vitesse" rel="noreferrer" target="_blank">
        Vitesse
      </a>
    </p>
    <p>
      <em text-sm opacity-75>{{ t("intro.desc") }}</em>
    </p>

    <div py-4 />

    <TheInput
      v-model="name"
      :placeholder="t('intro.whats-your-name')"
      autocomplete="false"
      @keydown.enter="go"
    />
    <label class="hidden" for="input">{{ t("intro.whats-your-name") }}</label>

    <div>
      <button
        :disabled="!name"
        m-3 text-sm btn
        @click="go"
      >
        {{ t("button.go") }}
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
layout: home
</route> -->
