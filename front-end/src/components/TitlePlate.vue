<script lang="ts" setup></script>

<template>
  <section class="title-plate" aria-label="RetroZetro banner">
    <div class="title-plate__frame">
      <RouterLink class="title-plate__brand" to="/">
        <img
          alt="RetroZetro Comics logo"
          class="title-plate__logo"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
        />
        <div>
          <span>RetroZetro Comics</span>
          <p>Retro futurism, bold heroes, and synthwave-styled adventure.</p>
        </div>
      </RouterLink>

      <div class="title-plate__ad" id="top-ad">
        <div class="vm-placement" data-id="5d821820f98d0e4b4cbd81f4" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.title-plate {
  width: 100%;
}

.title-plate__frame {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: stretch;
  padding: clamp(1.25rem, 2vw, 1.75rem);
  border-radius: 26px;
  background:
    linear-gradient(120deg, rgba(97, 53, 150, 0.95), rgba(37, 12, 65, 0.92)),
    radial-gradient(circle at top left, rgba(255, 145, 77, 0.18), transparent 65%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 25px 55px rgba(12, 3, 25, 0.45);
}

.title-plate__brand {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  text-decoration: none;
  color: #ffeeda;
}

.title-plate__logo {
  width: clamp(96px, 12vw, 132px);
  height: auto;
  filter: drop-shadow(0 14px 30px rgba(10, 0, 28, 0.45));
}

.title-plate__brand span {
  display: block;
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-size: clamp(1.35rem, 2.4vw, 1.75rem);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 700;
}

.title-plate__brand p {
  margin-top: 0.35rem;
  color: rgba(255, 235, 218, 0.8);
  font-size: 0.95rem;
  max-width: 32ch;
}

.title-plate__ad {
  position: relative;
  border-radius: 22px;
  padding: 1rem;
  background: rgba(17, 4, 33, 0.65);
  border: 1px dashed rgba(255, 255, 255, 0.22);
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-plate__ad::after {
  content: "Advertisement";
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 233, 209, 0.5);
}

@media (max-width: 768px) {
  .title-plate__brand {
    flex-direction: column;
    text-align: center;
  }

  .title-plate__brand p {
    margin: 0.5rem auto 0;
  }
}

@media (min-width: 768px) {
  .title-plate__frame {
    flex-direction: row;
    align-items: center;
  }

  .title-plate__ad {
    margin-left: auto;
    flex: 1;
  }
}
</style>
