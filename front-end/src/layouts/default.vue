<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
  <main class="layout-shell text-gray-200">
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
      <div
        id="center-plate"
        class="center-plate"
      >
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
  padding: 40px 0 60px;
  background: radial-gradient(circle at top, #7a4fbf 0%, #4b2278 40%, #140621 100%);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

#title-plate {
  align-items: center;
}

#mock-ad-1,
#mock-ad-2 {
  height: 140px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 145, 77, 0.9), rgba(96, 57, 133, 0.9));
  border: 4px dashed rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
}

#mock-ad-1::after,
#mock-ad-2::after {
  content: "ADVERTISEMENT";
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 700;
  letter-spacing: 0.2em;
}

.center-plate {
  background: linear-gradient(160deg, rgba(96, 57, 133, 0.95) 0%, rgba(28, 10, 51, 0.95) 100%);
  border: 16px solid #130522;
  border-radius: 32px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  backdrop-filter: blur(8px);
}

@media (max-width: 1100px) {
  #title-plate,
  .layout-shell > .grid {
    grid-template-columns: 1fr;
  }

  #mock-ad-1,
  #mock-ad-2 {
    height: 100px;
    margin: 0 auto;
    width: min(320px, 100%);
  }
}

@media (max-width: 900px) {
  .layout-shell {
    padding: 20px 0 40px;
  }

  .center-plate {
    border-width: 12px;
    border-radius: 24px;
  }
}
</style>
