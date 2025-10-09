<script lang="ts" setup></script>

<template>
  <aside class="ad-shell">
    <div id="side-ad" class="ad-panel">
      <div class="glow" />
      <span class="label">Advertisement</span>
      <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
    </div>
  </aside>
</template>

<style scoped>
.ad-shell {
  padding: 16px 0;
  display: flex;
  justify-content: center;
}

.ad-panel {
  position: relative;
  width: 160px;
  min-height: 480px;
  border-radius: 24px;
  border: 3px dashed rgba(255, 145, 77, 0.7);
  background: linear-gradient(200deg, rgba(255, 145, 77, 0.15), rgba(96, 57, 133, 0.35));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 700;
}

.ad-panel .glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.25), transparent 70%);
  mix-blend-mode: screen;
  opacity: 0.8;
}

.ad-panel .label {
  position: absolute;
  top: 22px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.75rem;
}

.vm-placement {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

@media (max-width: 1100px) {
  .ad-panel {
    width: min(320px, 90%);
    min-height: 160px;
  }

  .ad-panel .label {
    top: 16px;
  }
}
</style>
