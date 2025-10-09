<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
  <section class="comics" id="latest-issues">
    <header class="comics__header">
      <p class="eyebrow">Latest issues</p>
      <h2>Fresh stories from the RetroZetro multiverse</h2>
      <p class="subtitle">
        New chapters drop every other Friday — subscribe to the dispatch to catch behind-the-scenes art,
        lore drops, and playlists that inspired each issue.
      </p>
    </header>

    <div class="comics__grid">
      <article v-for="(item, index) in comics.comic" :key="index" class="comic-card">
        <div class="comic-card__media">
          <img :alt="item.imgAlt" :src="item.image" />
          <span class="comic-card__badge">Issue {{ index + 1 }}</span>
        </div>
        <div class="comic-card__body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <button class="comic-card__cta" type="button">Read preview</button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comics {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.comics__header {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  color: #ffe9d6;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comics__header .eyebrow {
  margin: 0;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  font-size: 0.78rem;
  color: rgba(255, 233, 214, 0.65);
}

.comics__header h2 {
  margin: 0;
  font-size: clamp(1.8rem, 4.5vw, 2.4rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.comics__header .subtitle {
  margin: 0 auto;
  font-size: 1rem;
  line-height: 1.65;
  color: rgba(255, 233, 214, 0.78);
}

.comics__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.75rem;
}

.comic-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, rgba(34, 14, 54, 0.9), rgba(86, 45, 120, 0.9));
  border: 1px solid rgba(255, 145, 77, 0.45);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 16px 28px rgba(9, 2, 21, 0.6);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.comic-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 34px rgba(9, 2, 21, 0.7);
}

.comic-card__media {
  position: relative;
  overflow: hidden;
}

.comic-card__media img {
  display: block;
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.comic-card__badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: rgba(255, 145, 77, 0.95);
  color: #2d1340;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.65rem;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  box-shadow: 0 8px 16px rgba(255, 145, 77, 0.45);
}

.comic-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  color: #ffe9d6;
}

.comic-card__body h3 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.comic-card__body p {
  margin: 0;
  line-height: 1.55;
  color: rgba(255, 233, 214, 0.8);
}

.comic-card__cta {
  align-self: flex-start;
  margin-top: auto;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2d1340;
  background: linear-gradient(135deg, #ff914d, #ffb067);
  cursor: pointer;
  box-shadow: 0 10px 18px rgba(255, 145, 77, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.comic-card__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(255, 145, 77, 0.55);
}

@media (max-width: 600px) {
  .comic-card__media img {
    height: 220px;
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
