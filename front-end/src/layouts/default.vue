<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
  <main class="layout-shell">
    <div class="layout-shell__stars" />

    <!-- Title Plate Section -->
    <div class="layout-grid">
      <div class="ad-placeholder">
        <span>Ad Portal</span>
      </div>
      <div class="layout-grid__center">
        <TitlePlate />
      </div>
      <div class="ad-placeholder">
        <span>Ad Portal</span>
      </div>
    </div>

    <!-- Main Content Section -->
    <div class="layout-grid">
      <SideAdvertisement />

      <!-- Center Plate -->
      <div class="center-plate">
        <TheHeader />
        <RouterView class="center-plate__content" />
        <TheFooter />
      </div>

      <SideAdvertisement />
    </div>
  </main>
</template>

<style scoped>
.layout-shell {
  position: relative;
  min-height: 100vh;
  padding: 2.5rem 1.5rem 4rem;
  background: radial-gradient(circle at top, rgba(255, 145, 77, 0.3) 0%, transparent 55%),
    radial-gradient(circle at bottom, rgba(96, 57, 133, 0.35) 0%, transparent 60%),
    linear-gradient(180deg, #12071e, #1b0c2d 60%, #2a1542);
  overflow: hidden;
}

.layout-shell__stars {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: 0.35;
  pointer-events: none;
}

.layout-grid {
  position: relative;
  display: grid;
  grid-template-columns: minmax(140px, 200px) minmax(0, 1fr) minmax(140px, 200px);
  gap: 1.5rem;
  width: min(1200px, 100%);
  margin: 0 auto 2.5rem;
  z-index: 1;
}

.layout-grid__center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ad-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 145, 77, 0.45);
  border-radius: 1.5rem;
  color: rgba(255, 233, 214, 0.65);
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  padding: 1rem;
  background: rgba(17, 8, 30, 0.45);
  box-shadow: inset 0 0 0 1px rgba(255, 145, 77, 0.1);
}

.center-plate {
  position: relative;
  background: linear-gradient(180deg, rgba(57, 27, 88, 0.95), rgba(25, 10, 40, 0.95));
  border: 4px solid rgba(0, 0, 0, 0.8);
  border-radius: 2rem;
  box-shadow: 0 25px 45px rgba(9, 2, 21, 0.65);
  overflow: hidden;
}

.center-plate::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid rgba(255, 145, 77, 0.45);
  pointer-events: none;
}

.center-plate__content {
  padding: 2.5rem clamp(1.5rem, 3vw, 3rem) 3rem;
}

@media (max-width: 960px) {
  .layout-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .ad-placeholder {
    display: none;
  }
}

@media (max-width: 720px) {
  .layout-shell {
    padding: 2rem 1rem 3rem;
  }

  .center-plate__content {
    padding: 2rem 1.25rem 2.5rem;
  }
}
</style>
