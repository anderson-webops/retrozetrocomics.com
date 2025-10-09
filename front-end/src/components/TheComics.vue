<script lang="ts" setup>
import { computed } from "vue";
import { useMainStore } from "~/stores";

const store = useMainStore();
const comics = computed(() => store.comics);
</script>

<template>
  <section aria-labelledby="featured-comics-title" class="comics" id="featured-comics">
    <header class="comics__header">
      <h2 id="featured-comics-title">Featured Issues</h2>
      <p>
        {{
          comics.description ||
            "Kick back with synthwave playlists and flip through stories where every neon-lit corner hides a portal to somewhere stranger."
        }}
      </p>
    </header>

    <div class="comics__grid">
      <article v-for="(item, index) in comics.comic" :key="index" class="comic-card">
        <div class="comic-card__media">
          <img
            :alt="item.imgAlt"
            :src="item.image"
            loading="lazy"
            class="comic-card__image"
          />
          <span class="comic-card__badge">{{ index + 1 }}</span>
        </div>
        <div class="comic-card__body">
          <h3>{{ item.name }}</h3>
          <p>{{ item.description }}</p>
        </div>
      </article>
    </div>

    <footer class="comics__footer">
      <RouterLink class="btn btn--primary" to="/contact">
        Get release alerts
      </RouterLink>
      <RouterLink class="btn btn--ghost" to="/about">Behind the panels</RouterLink>
    </footer>
  </section>
</template>

<style scoped>
.comics {
  margin-top: clamp(2rem, 5vw, 4rem);
  padding: clamp(2rem, 4vw, 3.5rem);
  border-radius: 32px;
  background: rgba(19, 5, 38, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 30px 55px rgba(8, 2, 18, 0.55);
  color: #fef9ff;
}

.comics__header {
  max-width: 620px;
  text-align: left;
}

.comics__header h2 {
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  color: #ffbd86;
  margin-bottom: 0.75rem;
}

.comics__header p {
  color: rgba(255, 235, 218, 0.82);
  font-size: 1.05rem;
}

.comics__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: clamp(1.5rem, 3vw, 2.5rem);
  margin-top: clamp(1.75rem, 3vw, 3rem);
}

.comic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(107, 53, 164, 0.95), rgba(44, 15, 82, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 45px rgba(12, 3, 28, 0.55);
  overflow: hidden;
}

.comic-card__media {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 35px rgba(5, 0, 12, 0.55);
}

.comic-card__image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.comic-card__badge {
  position: absolute;
  top: 16px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff914d, #ffce99);
  color: #38125f;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 12px 22px rgba(255, 145, 77, 0.35);
}

.comic-card__body h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.comic-card__body p {
  color: rgba(255, 235, 226, 0.82);
  font-size: 0.975rem;
}

.comics__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: clamp(2rem, 4vw, 3rem);
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

@media (max-width: 640px) {
  .comics__header {
    text-align: center;
    margin: 0 auto;
  }

  .comics__footer {
    justify-content: center;
  }
}
</style>

<route>
{
"meta": {
"layout": "default"
}
}
</route>
