<script lang="ts" setup></script>

<template>
  <aside class="side-ad">
    <div class="side-ad__inner">
      <p class="side-ad__label">Ad Space</p>
      <div class="side-ad__frame">
        <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
        <span class="side-ad__fallback">Neon-fueled promos go here.</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.side-ad {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.side-ad__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  max-width: 180px;
  background: linear-gradient(180deg, rgba(45, 21, 67, 0.95), rgba(96, 57, 133, 0.85));
  border: 2px solid rgba(255, 145, 77, 0.75);
  border-radius: 1.25rem;
  padding: 1.25rem 1rem;
  box-shadow: 0 14px 24px rgba(10, 3, 23, 0.55);
}

.side-ad__label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(255, 233, 214, 0.6);
}

.side-ad__frame {
  width: 100%;
  min-height: 180px;
  border: 1px dashed rgba(255, 145, 77, 0.55);
  border-radius: 0.85rem;
  background: rgba(16, 6, 30, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  text-align: center;
  position: relative;
}

.side-ad__fallback {
  font-size: 0.8rem;
  color: rgba(255, 233, 214, 0.55);
}
</style>
