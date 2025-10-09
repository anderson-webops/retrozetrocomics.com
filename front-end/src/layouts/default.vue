<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
  <main
    class="min-h-screen bg-gradient-to-b from-[#120b1c] via-[#241138] to-[#f48527] px-4 py-10 text-center text-gray-100"
  >
    <div
      class="mx-auto flex w-full max-w-[1200px] flex-col gap-8 rounded-[40px] border-2 border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur"
    >
      <!-- Title Plate Section -->
      <div
        id="title-plate"
        class="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]"
      >
        <div id="mock-ad-1" class="hidden lg:block">
          <SideAdvertisement variant="framed" />
        </div>
        <div class="flex items-center justify-center">
          <TitlePlate />
        </div>
        <div id="mock-ad-2" class="hidden lg:block">
          <SideAdvertisement variant="framed" />
        </div>
      </div>

      <!-- Main Content Section -->
      <div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
        <div class="hidden lg:block">
          <SideAdvertisement />
        </div>

        <!-- Center Plate -->
        <div
          id="center-plate"
          class="relative overflow-hidden rounded-[36px] border-[18px] border-solid border-[#160926] bg-gradient-to-br from-[#4a1c6e] via-[#603985] to-[#8a59bf] shadow-[0_25px_55px_rgba(0,0,0,0.6)]"
        >
          <div class="absolute inset-0 opacity-10 mix-blend-screen"
            style="background-image: radial-gradient(circle at 20% 20%, #ff914d 0, transparent 55%), radial-gradient(circle at 80% 30%, #ffb36e 0, transparent 45%), radial-gradient(circle at 50% 80%, #ffd8a6 0, transparent 40%);"
          />
          <div class="relative z-[1] flex flex-col">
            <TheHeader />
            <RouterView class="px-6 pb-10 pt-6" />
            <TheFooter />
          </div>
        </div>

        <div class="hidden lg:block">
          <SideAdvertisement />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped></style>
