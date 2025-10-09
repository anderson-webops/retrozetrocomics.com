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

const stats = [
  { value: "24", label: "Issues Released" },
  { value: "4", label: "Heroes Tracked" },
  { value: "12K", label: "Readers" },
  { value: "2", label: "Worlds Explored" },
];
</script>

<template>
  <section
    class="flex flex-col gap-8 rounded-[28px] border border-white/10 bg-white/10 p-8 text-left text-white shadow-[0_18px_45px_rgba(0,0,0,0.35)] md:flex-row md:items-stretch md:gap-10"
  >
    <div class="flex flex-1 flex-col justify-between gap-6">
      <div>
        <p class="text-xs uppercase tracking-[0.35em] text-[#ffb36e]">
          Welcome to RetroZetro Comics
        </p>
        <h2 class="mt-3 text-3xl font-black leading-tight md:text-4xl">
          Adventures that glow like a synthwave sunrise.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
          {{ props.message }}
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-[20px] border border-white/15 bg-[#2b1343]/60 p-4 text-center shadow-[0_10px_25px_rgba(0,0,0,0.35)]"
        >
          <p class="text-2xl font-bold text-[#ffcf99]">{{ stat.value }}</p>
          <p class="text-xs uppercase tracking-[0.3em] text-white/60">
            {{ stat.label }}
          </p>
        </div>
      </div>
    </div>
    <div
      class="relative flex flex-1 items-center justify-center overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br from-[#ff914d]/30 via-transparent to-[#ffb36e]/40"
    >
      <div class="absolute inset-0 bg-[url('https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg')] bg-cover bg-center opacity-30" />
      <div class="relative z-[1] flex flex-col items-center gap-4 px-6 py-10 text-center">
        <p class="text-sm uppercase tracking-[0.4em] text-white/80">
          Now Streaming
        </p>
        <h3 class="text-2xl font-bold text-white">Zetro: Neon Outlaw</h3>
        <p class="text-sm text-white/80">
          Ride along with the rogue glitch-runner as he hacks destiny across
          the technicolor skyline of Metro-Neon.
        </p>
        <RouterLink
          to="/characters"
          class="rounded-full border border-white/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white transition duration-300 hover:border-[#ffcf99] hover:bg-[#ffcf99]/10"
        >
          Meet the cast
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  animation: fade-in 0.6s ease both;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
