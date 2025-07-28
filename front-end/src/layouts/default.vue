<script lang="ts" setup>
import SideAdvertisement from "~/components/SideAdvertisement.vue";
</script>

<template>
  <main class="text-center text-gray-700 dark:text-gray-200">
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
        class="bg-[#603985] border-[20px] border-solid border-black"
      >
        <TheHeader />
        <RouterView class="px-4 py-5" />
        <TheFooter />
      </div>

      <SideAdvertisement />
    </div>
  </main>
</template>

<style scoped></style>
