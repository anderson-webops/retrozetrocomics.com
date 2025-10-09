<script lang="ts" setup></script>

<template>
  <aside class="side-ad" aria-label="Sidebar advertisement">
    <div class="side-ad__frame" id="side-ad">
      <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
    </div>
  </aside>
</template>

<style scoped>
.side-ad {
  display: flex;
  justify-content: center;
  padding-block: 1.25rem;
}

.side-ad__frame {
  width: min(180px, 100%);
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  border-radius: 26px;
  background: rgba(17, 4, 33, 0.65);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  box-shadow: 0 18px 40px rgba(8, 2, 20, 0.55);
  position: relative;
  overflow: hidden;
}

.side-ad__frame::before,
.side-ad__frame::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.35;
}

.side-ad__frame::before {
  width: 160px;
  height: 160px;
  background: rgba(255, 145, 77, 0.55);
  top: -50px;
  right: -60px;
}

.side-ad__frame::after {
  width: 120px;
  height: 120px;
  background: rgba(94, 48, 154, 0.55);
  bottom: -40px;
  left: -50px;
}

.side-ad__frame > * {
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .side-ad {
    display: none;
  }
}
</style>
