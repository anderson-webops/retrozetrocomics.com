<script lang="ts" setup></script>

<template>
  <section
    class="flex w-full flex-col gap-4 rounded-[32px] border border-white/10 bg-gradient-to-br from-[#1c0f2c] via-[#2d1342] to-[#4a1c6f] p-6 text-left shadow-[0_18px_45px_rgba(0,0,0,0.45)] md:flex-row md:items-center"
  >
    <RouterLink
      to="/"
      class="group relative mx-auto flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full border-4 border-[#ff914d]/80 bg-[#12091d] shadow-[0_10px_30px_rgba(0,0,0,0.55)]"
    >
      <span
        class="absolute inset-0 bg-gradient-to-tr from-[#ff914d]/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <img
        alt="RetroZetro Comics Logo"
        class="relative z-[1] w-[95px] h-auto"
        src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
      />
    </RouterLink>

    <div class="flex flex-1 flex-col gap-4 text-white">
      <div>
        <p class="text-sm uppercase tracking-[0.4em] text-[#ff914d]/90">
          Neon Tales Anthology
        </p>
        <h1 class="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
          RetroZetro Comics
        </h1>
        <p class="mt-2 text-base text-white/80 md:text-lg">
          Vintage vibes. Cosmic colors. High-energy adventures from the
          RetroZetro multiverse.
        </p>
      </div>
      <div
        class="flex flex-col items-center gap-3 rounded-[22px] border border-white/10 bg-white/5 p-4 text-center md:flex-row md:justify-between md:text-left"
      >
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-white/60">
            Featured Broadcast
          </p>
          <p class="text-sm font-semibold text-white/80">
            Issue drops every other Friday straight from the cosmic press.
          </p>
        </div>
        <RouterLink
          to="/contact"
          class="rounded-full bg-[#ff914d] px-5 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-[#2d1342] transition duration-300 hover:bg-[#ffc389]"
        >
          Subscribe
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
