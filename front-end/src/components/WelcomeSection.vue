<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    name?: string;
    message?: string;
  }>(),
  {
    name: "Home",
  },
);
</script>

<template>
  <section class="welcome">
    <div class="welcome__content">
      <div class="welcome__copy">
        <p class="eyebrow">Welcome to the neon frontier</p>
        <h1>
          RetroZetro Comics
          <span>Pulse-pounding sci-fi with a retro heartbeat.</span>
        </h1>
        <p class="lead">{{ props.message }}</p>
        <div class="welcome__cta">
          <RouterLink class="button button--primary" to="/characters">
            Meet the cast
          </RouterLink>
          <a class="button button--ghost" href="#latest-issues">Read the latest issues</a>
        </div>
      </div>
      <div class="welcome__visual">
        <div class="welcome__glow" />
        <img
          alt="Collage of RetroZetro heroes"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg"
        />
      </div>
    </div>

    <ul class="welcome__highlights">
      <li>
        <h3>Arcade-inspired storytelling</h3>
        <p>Every saga is a high-score chase through synth-saturated cityscapes and cosmic battlegrounds.</p>
      </li>
      <li>
        <h3>Character-driven drama</h3>
        <p>From time-bending rebels to spirit-speaking mystics, the RetroZetro crew fights with heart.</p>
      </li>
      <li>
        <h3>Community-powered</h3>
        <p>Join fellow readers, share theories, and vote on the next mission in the RetroZetro dispatch.</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.welcome__content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2.5rem;
  align-items: center;
}

.welcome__copy {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #ffe9d6;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.8rem;
  color: rgba(255, 233, 214, 0.7);
}

h1 {
  margin: 0;
  font-size: clamp(2.1rem, 5vw, 3rem);
  line-height: 1.1;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h1 span {
  font-size: clamp(1rem, 2.2vw, 1.3rem);
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgba(255, 233, 214, 0.7);
}

.lead {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 233, 214, 0.85);
}

.welcome__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 0.85rem 1.8rem;
  border-radius: 999px;
  text-decoration: none;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.button--primary {
  color: #2d1340;
  background: linear-gradient(135deg, #ff914d, #ffb067);
  box-shadow: 0 10px 22px rgba(255, 145, 77, 0.45);
}

.button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 26px rgba(255, 145, 77, 0.6);
}

.button--ghost {
  color: #ffe9d6;
  border: 2px solid rgba(255, 233, 214, 0.35);
  background: transparent;
}

.button--ghost:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 145, 77, 0.75);
  box-shadow: 0 12px 24px rgba(255, 145, 77, 0.35);
}

.welcome__visual {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome__visual img {
  width: min(360px, 100%);
  border-radius: 1.75rem;
  border: 4px solid rgba(255, 145, 77, 0.75);
  box-shadow: 0 18px 36px rgba(10, 3, 23, 0.65);
  position: relative;
  z-index: 1;
}

.welcome__glow {
  position: absolute;
  width: 85%;
  height: 85%;
  background: radial-gradient(circle at center, rgba(255, 145, 77, 0.5), transparent 70%);
  filter: blur(8px);
  z-index: 0;
}

.welcome__highlights {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 0;
  margin: 0;
}

.welcome__highlights li {
  background: rgba(24, 11, 36, 0.75);
  border: 1px solid rgba(255, 145, 77, 0.4);
  border-radius: 1.25rem;
  padding: 1.5rem;
  color: #ffe9d6;
  box-shadow: 0 12px 24px rgba(8, 3, 20, 0.55);
  transition: transform 0.25s ease;
}

.welcome__highlights li:hover {
  transform: translateY(-4px);
}

.welcome__highlights h3 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #ffb067;
}

.welcome__highlights p {
  margin: 0;
  color: rgba(255, 233, 214, 0.78);
  line-height: 1.55;
}

@media (max-width: 640px) {
  .welcome__cta {
    flex-direction: column;
  }

  .welcome__visual img {
    width: 100%;
  }
}
</style>
