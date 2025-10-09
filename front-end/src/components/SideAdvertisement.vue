<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    variant?: "default" | "framed";
  }>(),
  {
    variant: "default",
  },
);

const baseClasses =
  "mx-auto flex w-full max-w-[180px] justify-center rounded-[24px] border border-white/20 bg-gradient-to-b from-white/15 to-white/5 p-4 shadow-[0_12px_30px_rgba(0,0,0,0.35)]";
const framedClasses =
  "relative mx-auto flex w-full max-w-[220px] justify-center rounded-[28px] border-2 border-[#ff914d]/80 bg-[#2f0f4a] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.45)] before:absolute before:inset-[6px] before:rounded-[22px] before:border before:border-white/20 before:content-['']";
</script>

<template>
  <nav class="flex items-center justify-center py-4">
    <div
      id="side-ad"
      :class="[
        props.variant === 'framed' ? framedClasses : baseClasses,
        'transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.45)]',
      ]"
    >
      <div class="text-left text-sm uppercase tracking-[0.3em] text-white/80">
        Advertisement
        <div class="mt-3 h-[110px] w-[110px] rounded-full border-2 border-dashed border-[#ff914d]/70 bg-gradient-to-br from-[#ff914d]/30 to-transparent" />
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
