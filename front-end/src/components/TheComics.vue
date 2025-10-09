<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
  <section class="comics-section">
    <header class="comics-header">
      <p class="eyebrow">Featured Issues</p>
      <h2>Latest RetroZetro Adventures</h2>
      <p class="lede">{{ comics.description }}</p>
    </header>
    <div class="comics-grid">
      <article v-for="(item, index) in comics.comic" :key="index" class="comic-card">
        <div class="cover">
          <img :alt="item.imgAlt" :src="item.image" loading="lazy" />
          <span class="issue-tag">Issue {{ index + 1 }}</span>
        </div>
        <div class="card-body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
          <button class="cta" type="button">
            Read preview
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.comics-section {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 1rem;
}

.comics-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
  color: rgba(255, 255, 255, 0.85);
}

.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: rgba(255, 179, 110, 0.9);
}

.comics-header h2 {
  font-size: clamp(1.75rem, 3vw, 2.4rem);
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.lede {
  font-size: 1rem;
  max-width: 42rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

.comics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.75rem;
}

.comic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 24px;
  background: rgba(22, 7, 36, 0.6);
  border: 1px solid rgba(255, 145, 77, 0.35);
  box-shadow: 0 25px 55px rgba(0, 0, 0, 0.45);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.comic-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255, 145, 77, 0.25), transparent 45%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.comic-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 35px 70px rgba(0, 0, 0, 0.55);
}

.comic-card:hover::before {
  opacity: 1;
}

.cover {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.comic-card:hover .cover img {
  transform: scale(1.05);
}

.issue-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(22, 7, 36, 0.8);
  color: rgba(255, 179, 110, 0.95);
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.6rem;
  text-align: left;
  color: rgba(255, 255, 255, 0.82);
}

.card-body h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.3;
  color: #ffcf99;
}

.card-body p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.75);
}

.cta {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff914d, #ffc389);
  color: #2d1342;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  padding: 0.6rem 1.6rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.cta span {
  font-size: 1rem;
}

.cta:hover {
  transform: translateX(6px);
  box-shadow: 0 15px 30px rgba(255, 145, 77, 0.35);
}

@media (max-width: 768px) {
  .comics-section {
    gap: 2rem;
  }

  .card-body {
    padding: 1.35rem;
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
