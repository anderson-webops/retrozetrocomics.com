<script lang="ts" setup></script>

<template>
  <nav class="my-5 py-2 flex flex-col items-center w-full md:flex-row">
    <!-- Logo Container -->
    <div
      class="flex flex-1 justify-center items-center w-full mb-3 md:w-auto md:mb-0"
    >
      <RouterLink to="/">
        <img
          alt="RetroZetro Comics Logo"
          class="w-[120px] h-auto"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
        />
      </RouterLink>
    </div>

    <!-- Ad Placement -->
    <div
      id="top-ad"
      class="w-full flex items-center justify-center bg-gray-100 h-auto p-2 md:w-3/4 md:justify-end md:h-[100px]"
    >
      <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
    </div>
  </nav>
</template>

<style scoped></style>
