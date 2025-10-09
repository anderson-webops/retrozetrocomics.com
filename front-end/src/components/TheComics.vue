<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);

const coverStyle = (image?: string) => ({
  backgroundImage: image
    ? `linear-gradient(rgba(17, 8, 29, 0.1), rgba(17, 8, 29, 0.55)), url(${image})`
    : "radial-gradient(circle at 20% 20%, rgba(255, 145, 77, 0.5), transparent 70%), radial-gradient(circle at 80% 80%, rgba(96, 57, 133, 0.55), transparent 70%)",
});
</script>

<template>
  <section id="comics" aria-labelledby="comics-heading" class="comics-section">
    <header class="section-header">
      <span class="eyebrow">Featured Issues</span>
      <h2 id="comics-heading">Stories from the RetroZetro Universe</h2>
      <p>
        Explore the latest chapters, character spotlights, and crossover specials. Each release
        is illustrated with a blend of neon nostalgia and future-forward storytelling.
      </p>
    </header>

    <div class="items-container">
      <article v-for="(item, index) in comics.comic" :key="index" class="item">
        <div :style="coverStyle(item.image)" class="item-cover" role="img" :aria-label="item.imgAlt" />
        <div class="item-body">
          <h3>{{ item.name }}</h3>
          <p>
            {{
              item.description ||
                "A limited-edition issue brimming with kinetic action, luminous palettes, and pulse-quickening cliffhangers."
            }}
          </p>
          <div class="meta">
            <span class="issue-tag">Episode {{ index + 1 }}</span>
            <RouterLink class="cta" to="/characters">Meet the cast</RouterLink>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comics-section {
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 4vw, 42px);
}

.section-header {
  text-align: left;
  display: grid;
  gap: 14px;
  color: rgba(255, 255, 255, 0.82);
}

.section-header .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.32em;
  font-size: 0.75rem;
  color: rgba(255, 145, 77, 0.8);
}

.section-header h2 {
  font-size: clamp(1.6rem, 3.2vw, 2.2rem);
  font-weight: 800;
  color: #ffddb9;
}

.section-header p {
  max-width: 60ch;
  color: rgba(255, 255, 255, 0.72);
}

.items-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: clamp(18px, 3vw, 30px);
}

.item {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  background: rgba(15, 3, 27, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.item:hover {
  transform: translateY(-6px);
  box-shadow: 0 26px 45px rgba(0, 0, 0, 0.55);
}

.item-cover {
  width: 100%;
  padding-top: 68%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.item-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: clamp(18px, 3vw, 24px);
  color: rgba(255, 255, 255, 0.82);
}

.item-body h3 {
  font-size: clamp(1.2rem, 2.5vw, 1.5rem);
  font-weight: 800;
  color: #ffb770;
}

.item-body p {
  font-size: 0.95rem;
  line-height: 1.6;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}

.issue-tag {
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(96, 57, 133, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.7rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.cta {
  text-decoration: none;
  padding: 10px 18px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 145, 77, 0.9), rgba(255, 145, 77, 0.65));
  color: #200631;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.7rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 30px rgba(255, 145, 77, 0.45);
}

@media (max-width: 640px) {
  .meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
