<script lang="ts" setup>
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    name?: string;
    message?: string;
  }>(),
  {
    name: "Home",
  },
);

const heroMessage = computed(
  () =>
    props.message?.trim().length
      ? props.message
      : "Dive into original sci-fi adventures full of neon grit, synthwave heroes, and cosmic mystery.",
);

const highlights = [
  "Hand-crafted digital illustrations",
  "Weekly drops & behind-the-panels blog",
  "Community art jams & creator livestreams",
];
</script>

<template>
  <section class="welcome" aria-labelledby="retrozetro-headline">
    <div class="backdrop" aria-hidden="true">
      <span class="orb orb-one" />
      <span class="orb orb-two" />
      <span class="orb orb-three" />
    </div>

    <div class="welcome-inner">
      <div class="copy-block">
        <p class="eyebrow">New episodes stream every Friday night</p>
        <h1 id="retrozetro-headline">RetroZetro Comics</h1>
        <p class="lead">{{ heroMessage }}</p>

        <div class="cta-group">
          <RouterLink class="cta primary" to="#comics">Explore the Saga</RouterLink>
          <RouterLink class="cta secondary" to="/about">Meet the Creator</RouterLink>
        </div>

        <ul class="highlight-list">
          <li v-for="item in highlights" :key="item">
            <span class="bullet" aria-hidden="true" />
            {{ item }}
          </li>
        </ul>
      </div>

      <div class="showcase" role="presentation">
        <div class="issue-card">
          <span class="issue-chip">Issue #07</span>
          <h2>Neon Skies of Auriga</h2>
          <p>
            A rebel pilot, a techno-shaman, and a city suspended over a black hole.
            Strap in for a synth-laced odyssey.
          </p>
          <div class="tag-grid">
            <span class="tag">Synthwave</span>
            <span class="tag">Cosmic Noir</span>
            <span class="tag">Found Family</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.welcome {
  position: relative;
  border-radius: 26px;
  overflow: hidden;
  padding: clamp(32px, 6vw, 64px) clamp(28px, 5vw, 80px);
  background: linear-gradient(140deg, rgba(20, 6, 33, 0.95), rgba(96, 57, 133, 0.75));
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(0);
  opacity: 0.75;
}

.orb-one {
  width: 240px;
  height: 240px;
  top: -80px;
  left: -60px;
  background: radial-gradient(circle, rgba(255, 145, 77, 0.65), transparent 70%);
}

.orb-two {
  width: 320px;
  height: 320px;
  bottom: -160px;
  right: -110px;
  background: radial-gradient(circle, rgba(96, 57, 133, 0.8), transparent 75%);
}

.orb-three {
  width: 180px;
  height: 180px;
  bottom: 40px;
  left: 30%;
  background: radial-gradient(circle, rgba(255, 190, 130, 0.45), transparent 80%);
}

.welcome-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: clamp(24px, 5vw, 48px);
  align-items: center;
  color: #ffe9d6;
}

.copy-block {
  display: flex;
  flex-direction: column;
  gap: 18px;
  z-index: 1;
}

.eyebrow {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  color: rgba(255, 145, 77, 0.85);
}

h1 {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  font-weight: 900;
  line-height: 1.05;
}

.lead {
  font-size: clamp(1rem, 1.9vw, 1.2rem);
  color: rgba(255, 255, 255, 0.82);
  max-width: 42ch;
}

.cta-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.cta {
  padding: 12px 26px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.cta.primary {
  background: linear-gradient(135deg, #ff914d, #ffb770);
  color: #1e052f;
  box-shadow: 0 12px 25px rgba(255, 145, 77, 0.4);
}

.cta.secondary {
  border: 2px solid rgba(255, 255, 255, 0.6);
  color: rgba(255, 255, 255, 0.85);
  background: transparent;
}

.cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.45);
}

.highlight-list {
  display: grid;
  gap: 10px;
}

.highlight-list li {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
}

.highlight-list .bullet {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff914d, #ffc091);
  box-shadow: 0 0 10px rgba(255, 145, 77, 0.6);
}

.showcase {
  position: relative;
  z-index: 1;
}

.issue-card {
  border-radius: 26px;
  padding: clamp(24px, 4vw, 36px);
  background: linear-gradient(170deg, rgba(15, 3, 27, 0.95), rgba(96, 57, 133, 0.75));
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 360px;
}

.issue-card h2 {
  font-size: clamp(1.4rem, 2.4vw, 1.9rem);
  font-weight: 800;
}

.issue-card p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
}

.issue-chip {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  background: rgba(255, 145, 77, 0.2);
  border: 1px solid rgba(255, 145, 77, 0.5);
  color: rgba(255, 191, 153, 0.95);
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  background: rgba(96, 57, 133, 0.6);
  color: rgba(255, 255, 255, 0.78);
}

@media (max-width: 960px) {
  .welcome-inner {
    grid-template-columns: 1fr;
  }

  .showcase {
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .cta-group {
    width: 100%;
  }

  .cta {
    flex: 1 1 100%;
    text-align: center;
  }

  .issue-card {
    max-width: 100%;
  }
}
</style>
