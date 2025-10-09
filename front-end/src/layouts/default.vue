<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
  <main class="layout-shell text-center text-gray-700 dark:text-gray-200">
    <!-- Title Plate Section -->
    <div
      id="title-plate"
      class="grid grid-cols-[200px_1fr_200px] gap-[10px] w-full"
    >
      <div id="mock-ad-1" class="mx-10" />
      <div class="flex items-center justify-center">
        <TitlePlate />
      </div>
      <div id="mock-ad-2" class="mx-10" />
    </div>

    <!-- Main Content Section -->
    <div class="grid grid-cols-[200px_1fr_200px] gap-[10px] w-full">
      <SideAdvertisement />

      <!-- Center Plate -->
      <div id="center-plate" class="center-plate">
        <TheHeader />
        <RouterView class="px-4 py-5" />
        <TheFooter />
      </div>

      <SideAdvertisement />
    </div>
  </main>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  padding: clamp(1.5rem, 3vw, 3rem) clamp(1rem, 3vw, 2.5rem) clamp(4rem, 6vw, 6rem);
  background:
    radial-gradient(circle at top left, rgba(255, 155, 86, 0.25), transparent 55%),
    radial-gradient(circle at bottom right, rgba(96, 57, 133, 0.35), transparent 60%),
    linear-gradient(160deg, #3a1369 0%, #120422 65%, #0c0616 100%);
}

#title-plate {
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

.center-plate {
  position: relative;
  overflow: hidden;
  border-radius: 32px 32px 40px 40px;
  border: 2px solid rgba(255, 255, 255, 0.08);
  background:
    linear-gradient(145deg, rgba(92, 51, 140, 0.92), rgba(33, 11, 61, 0.92)),
    radial-gradient(circle at top right, rgba(255, 145, 77, 0.15), transparent 45%);
  box-shadow: 0 40px 80px rgba(8, 3, 16, 0.7);
}

.center-plate::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.08), transparent 60%);
  pointer-events: none;
}

@media (max-width: 1024px) {
  #title-plate,
  .layout-shell > .grid {
    grid-template-columns: 1fr;
  }

  #mock-ad-1,
  #mock-ad-2 {
    display: none;
  }
}

@media (max-width: 768px) {
  .layout-shell {
    padding-inline: 1rem;
  }
}
</style>
