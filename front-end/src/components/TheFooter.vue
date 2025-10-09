<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <footer class="footer">
    <div class="footer__content">
      <div>
        <h2>Stay connected</h2>
        <p>
          Sign up for drops, sketchbook previews, and behind-the-panel livestreams.
        </p>
      </div>
      <a class="footer__cta" href="mailto:retrozetrocomics@gmail.com">retrozetrocomics@gmail.com</a>
    </div>

    <nav aria-label="Social media" class="footer__social">
      <ul>
        <li>
          <a href="https://www.github.com/Jacoba1100254352" rel="noreferrer" target="_blank">
            <FontAwesomeIcon :icon="['fab', 'github']" size="lg" />
            <span class="sr-only">GitHub</span>
          </a>
        </li>
      </ul>
    </nav>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: clamp(2.5rem, 4vw, 4rem);
  padding: clamp(1.75rem, 3vw, 2.25rem);
  border-radius: 28px 28px 36px 36px;
  background:
    linear-gradient(135deg, rgba(36, 11, 63, 0.85), rgba(13, 4, 28, 0.92)),
    radial-gradient(circle at right, rgba(255, 145, 77, 0.16), transparent 60%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 -25px 45px rgba(6, 1, 16, 0.6);
  color: #fef7ff;
}

.footer__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

h2 {
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.35rem;
  color: #ffbd86;
}

p {
  color: rgba(255, 235, 218, 0.78);
  max-width: 40ch;
}

.footer__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffeeda;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.65rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 229, 214, 0.5);
  transition: transform 0.25s ease, background 0.25s ease;
}

.footer__cta:hover {
  transform: translateY(-2px);
  background: rgba(26, 9, 41, 0.5);
}

.footer__social {
  margin-top: 1.75rem;
}

.footer__social ul {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer__social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(255, 229, 214, 0.4);
  color: #ffeeda;
  text-decoration: none;
  transition: transform 0.25s ease, background 0.25s ease;
}

.footer__social a:hover {
  transform: translateY(-2px);
  background: rgba(255, 145, 77, 0.25);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

@media (min-width: 768px) {
  .footer__content {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
