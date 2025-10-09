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
</script>

<template>
  <section aria-labelledby="welcome-title" class="welcome">
    <div class="welcome__content">
      <span class="welcome__eyebrow">New adventures every week</span>
      <h1 id="welcome-title">Step into the world of RetroZetro Comics</h1>
      <p>
        {{
          props.message
            ||
            "Follow Zetro, Kazay, Exo, and Shaman as they dash across neon skylines, desert planets, and dreamscapes stitched together by retro vibes."
        }}
      </p>
      <div class="welcome__actions">
        <RouterLink
          :to="{ path: '/', hash: '#featured-comics' }"
          class="btn btn--primary"
        >
          Explore the Comics
        </RouterLink>
        <RouterLink class="btn btn--ghost" to="/characters">
          Meet the Heroes
        </RouterLink>
      </div>
      <dl class="welcome__stats">
        <div class="stat">
          <dt>Years sketching</dt>
          <dd>10+</dd>
        </div>
        <div class="stat">
          <dt>Main story arcs</dt>
          <dd>4</dd>
        </div>
        <div class="stat">
          <dt>Weekly readers</dt>
          <dd>5k</dd>
        </div>
      </dl>
    </div>

    <div class="welcome__art" role="presentation">
      <div class="welcome__orbit">
        <div class="welcome__glow" />
        <img
          alt="Illustration of Zetro ready for action"
          class="welcome__image"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Zetro2.jpg"
        />
        <div class="welcome__spark welcome__spark--one" />
        <div class="welcome__spark welcome__spark--two" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.welcome {
  position: relative;
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: center;
  padding: clamp(2rem, 3vw, 3.5rem);
  border-radius: 28px;
  background: radial-gradient(circle at 20% 20%, rgba(255, 216, 168, 0.2), transparent),
    linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 25px 45px rgba(16, 5, 30, 0.35);
  color: #fef7ff;
}

.welcome__content {
  text-align: left;
}

.welcome__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffbd86;
  background: rgba(255, 145, 77, 0.12);
}

.welcome__eyebrow::before {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ff914d;
  box-shadow: 0 0 12px rgba(255, 145, 77, 0.75);
}

h1 {
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-size: clamp(2.25rem, 4vw, 3.1rem);
  line-height: 1.1;
  margin-block: 1rem 0.75rem;
}

p {
  font-size: 1.05rem;
  color: rgba(255, 243, 236, 0.88);
  max-width: 32ch;
}

.welcome__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-block: 1.5rem 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.4rem;
  border-radius: 999px;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.btn--primary {
  background: linear-gradient(135deg, #ff914d, #ffb86b);
  color: #2f1057;
  box-shadow: 0 18px 25px rgba(255, 145, 77, 0.45);
}

.btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 30px rgba(255, 145, 77, 0.5);
}

.btn--ghost {
  border: 1px solid rgba(255, 229, 214, 0.6);
  color: #ffeeda;
  background: rgba(26, 9, 41, 0.35);
}

.btn--ghost:hover {
  background: rgba(26, 9, 41, 0.55);
  transform: translateY(-2px);
}

.welcome__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 1rem;
  margin: 0;
}

.stat {
  padding: 1rem;
  border-radius: 18px;
  background: rgba(18, 5, 34, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  text-align: center;
}

.stat dt {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 235, 218, 0.7);
}

.stat dd {
  margin: 0.35rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffbd86;
}

.welcome__art {
  display: flex;
  justify-content: center;
}

.welcome__orbit {
  position: relative;
  width: min(360px, 100%);
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 30%, rgba(255, 145, 77, 0.2), transparent 70%),
    linear-gradient(145deg, rgba(112, 49, 168, 0.8), rgba(38, 9, 76, 0.9));
  display: grid;
  place-items: center;
  box-shadow: 0 30px 45px rgba(20, 6, 37, 0.55);
  overflow: hidden;
}

.welcome__glow {
  position: absolute;
  inset: 10%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 196, 125, 0.6), transparent 70%);
  filter: blur(8px);
}

.welcome__image {
  position: relative;
  width: 78%;
  border-radius: 24px;
  border: 4px solid rgba(255, 240, 226, 0.75);
  box-shadow: 0 18px 35px rgba(0, 0, 0, 0.35);
}

.welcome__spark {
  position: absolute;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 206, 148, 0.8), transparent 65%);
  filter: blur(1px);
}

.welcome__spark--one {
  top: 14%;
  right: -15%;
}

.welcome__spark--two {
  bottom: -12%;
  left: -10%;
}

@media (max-width: 640px) {
  .welcome {
    text-align: center;
  }

  .welcome__content {
    text-align: center;
  }

  p {
    margin: 0 auto;
  }

  .welcome__actions {
    justify-content: center;
  }

  .welcome__stats {
    justify-items: center;
  }
}
</style>
