<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <h2>Stay plugged into RetroZetro</h2>
        <p>
          Join the broadcast list for advance drops, behind-the-panels sketches,
          and live sketch stream alerts.
        </p>
      </div>
      <div class="footer__cta">
        <a class="footer__button" href="mailto:retrozetrocomics@gmail.com">
          Say hello
        </a>
        <p class="footer__caption">retrozetrocomics@gmail.com</p>
      </div>
      <nav class="footer__social" aria-label="Social media">
        <a
          href="https://www.github.com/Jacoba1100254352"
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon :icon="['fab', 'github']" size="lg" />
        </a>
      </nav>
    </div>
    <p class="footer__legal">© {{ new Date().getFullYear() }} RetroZetro Comics</p>
  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  text-align: left;
}

.footer__grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  align-items: center;
}

.footer__brand h2 {
  margin: 0 0 0.65rem;
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 700;
  color: #ffcf99;
}

.footer__brand p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
}

.footer__cta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.6rem;
}

.footer__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1.6rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 145, 77, 0.45);
  background: rgba(255, 145, 77, 0.1);
  color: #ffcf99;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.7rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.footer__button:hover {
  background: rgba(255, 145, 77, 0.2);
  border-color: rgba(255, 145, 77, 0.7);
}

.footer__caption {
  margin: 0;
  font-size: 0.8rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.footer__social {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.footer__social a {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 145, 77, 0.15);
  color: #ffcf99;
  transition: transform 0.3s ease, background 0.3s ease;
}

.footer__social a:hover {
  transform: translateY(-4px);
  background: rgba(255, 145, 77, 0.25);
}

.footer__legal {
  margin: 0;
  text-align: center;
  font-size: 0.7rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 640px) {
  .footer__social {
    justify-content: flex-start;
  }
}
</style>
