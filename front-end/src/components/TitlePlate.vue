<script lang="ts" setup></script>

<template>
  <section class="title-plate">
    <div class="title-plate__content">
      <RouterLink class="logo" to="/">
        <img
          alt="RetroZetro Comics Logo"
          class="logo__image"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
        />
        <div class="logo__text">
          <span class="logo__headline">RetroZetro Comics</span>
          <span class="logo__subhead">Outrun the ordinary.</span>
        </div>
      </RouterLink>

      <div class="title-plate__divider" />

      <div class="ad-slot">
        <p class="ad-slot__label">Sponsored Spotlight</p>
        <div class="ad-slot__frame">
          <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
          <p class="ad-slot__fallback">Your message could beam from here.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.title-plate {
  width: 100%;
  padding: 1.5rem 1rem;
}

.title-plate__content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, rgba(96, 57, 133, 0.95), rgba(42, 20, 62, 0.92));
  border: 3px solid rgba(255, 145, 77, 0.85);
  border-radius: 1.75rem;
  box-shadow: 0 15px 35px rgba(13, 4, 26, 0.5);
  max-width: 960px;
  margin: 0 auto;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 1rem;
  color: #ffe7d2;
}

.logo__image {
  width: clamp(96px, 12vw, 140px);
  height: auto;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45));
}

.logo__text {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.logo__headline {
  font-family: "Orbitron", "Rajdhani", "Exo 2", sans-serif;
  font-size: clamp(1.35rem, 4vw, 2.1rem);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.logo__subhead {
  font-size: 1rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 233, 214, 0.7);
}

.title-plate__divider {
  width: 1px;
  height: 100px;
  background: linear-gradient(180deg, transparent, rgba(255, 145, 77, 0.8), transparent);
}

.ad-slot {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  color: #ffe7d2;
  text-align: left;
}

.ad-slot__label {
  font-size: 0.85rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: rgba(255, 233, 214, 0.65);
  margin: 0;
}

.ad-slot__frame {
  width: min(320px, 100%);
  min-height: 110px;
  background: rgba(15, 5, 28, 0.55);
  border: 1px dashed rgba(255, 145, 77, 0.7);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.ad-slot__fallback {
  margin: 0;
  color: rgba(255, 233, 214, 0.55);
  font-size: 0.9rem;
}

@media (max-width: 900px) {
  .title-plate__content {
    flex-direction: column;
    text-align: center;
  }

  .title-plate__divider {
    width: 60%;
    height: 1px;
  }

  .ad-slot {
    align-items: center;
  }
}
</style>
