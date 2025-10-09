<script lang="ts" setup></script>

<template>
  <nav class="title-shell">
    <RouterLink class="logo" to="/">
      <img
        alt="RetroZetro Comics Logo"
        src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
      />
      <div class="wordmark">
        <span class="eyebrow">RetroZetro Comics</span>
        <h1>Chronicles of Neon Worlds</h1>
        <p>Original stories, pulsing neon, unapologetic adventure.</p>
      </div>
    </RouterLink>

    <div id="top-ad" class="top-ad">
      <div class="ad-label">Sponsored Spotlight</div>
      <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
    </div>
  </nav>
</template>

<style scoped>
.title-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 24px;
  align-items: stretch;
  padding: 24px 32px;
  border-radius: 28px;
  background: linear-gradient(120deg, rgba(19, 5, 34, 0.95), rgba(96, 57, 133, 0.85));
  box-shadow: 0 28px 55px rgba(0, 0, 0, 0.45);
}

.logo {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 18px;
  align-items: center;
  padding: 12px 20px;
  border-radius: 22px;
  background: rgba(20, 6, 33, 0.65);
  text-decoration: none;
  color: inherit;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.logo:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.4);
}

.logo img {
  width: 110px;
  height: auto;
  filter: drop-shadow(0 0 12px rgba(255, 145, 77, 0.65));
}

.wordmark {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wordmark .eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  color: rgba(255, 145, 77, 0.85);
}

.wordmark h1 {
  font-size: clamp(1.5rem, 2.6vw, 2.4rem);
  font-weight: 800;
  color: #ffe9d6;
}

.wordmark p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.78);
}

.top-ad {
  position: relative;
  border-radius: 22px;
  background: linear-gradient(110deg, rgba(255, 145, 77, 0.25), rgba(255, 145, 77, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 160px;
  overflow: hidden;
}

.top-ad::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 145, 77, 0.25), transparent 65%);
}

.top-ad .ad-label {
  position: absolute;
  top: 18px;
  right: 18px;
  background: rgba(96, 57, 133, 0.65);
  color: #ffe9d6;
  font-size: 0.75rem;
  padding: 6px 14px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  z-index: 2;
}

.vm-placement {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

@media (max-width: 960px) {
  .title-shell {
    grid-template-columns: 1fr;
  }

  .top-ad {
    min-height: 140px;
  }
}

@media (max-width: 640px) {
  .logo {
    grid-template-columns: 1fr;
    text-align: center;
    justify-items: center;
  }

  .wordmark h1 {
    font-size: 1.6rem;
  }
}
</style>
