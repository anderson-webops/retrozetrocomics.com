<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <footer class="footer-shell">
    <div class="footer-grid">
      <div class="brand">
        <h2>Stay in the Synthstream</h2>
        <p>
          Join the RetroZetro signal for early issue drops, behind-the-panel sketches,
          and cosmic tales straight from the creator.
        </p>
        <a class="newsletter" href="mailto:retrozetrocomics@gmail.com">
          retrozetrocomics@gmail.com
        </a>
      </div>

      <nav aria-label="Footer navigation" class="footer-nav">
        <h3>Explore</h3>
        <ul>
          <li><RouterLink to="/">Home</RouterLink></li>
          <li><RouterLink to="/characters">Characters</RouterLink></li>
          <li><RouterLink to="/about">About</RouterLink></li>
          <li><RouterLink to="/contact">Contact</RouterLink></li>
        </ul>
      </nav>

      <div class="social">
        <h3>Connect</h3>
        <ul>
          <li>
            <a href="https://www.github.com/Jacoba1100254352" target="_blank" rel="noopener">
              <FontAwesomeIcon :icon="['fab', 'github']" size="2x" />
              <span class="sr-only">GitHub</span>
            </a>
          </li>
        </ul>
        <p class="copyright">© {{ new Date().getFullYear() }} RetroZetro Comics</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-shell {
  background: linear-gradient(180deg, rgba(12, 2, 25, 0.95), rgba(10, 2, 22, 0.9));
  padding: clamp(32px, 5vw, 56px);
  color: rgba(255, 255, 255, 0.75);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
  gap: clamp(24px, 5vw, 48px);
}

.brand h2 {
  font-size: clamp(1.3rem, 2.5vw, 1.9rem);
  font-weight: 800;
  color: #ffb770;
  margin-bottom: 12px;
}

.brand p {
  margin-bottom: 18px;
  max-width: 42ch;
}

.newsletter {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  border-radius: 999px;
  background: rgba(255, 145, 77, 0.15);
  border: 1px solid rgba(255, 145, 77, 0.35);
  color: #ffddb9;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.newsletter:hover {
  background: rgba(255, 145, 77, 0.25);
}

.footer-nav h3,
.social h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 16px;
}

.footer-nav ul,
.social ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.footer-nav a {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.75);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  transition: color 0.3s ease;
}

.footer-nav a:hover {
  color: #ffb770;
}

.social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #ffddb9;
  transition: transform 0.3s ease, background 0.3s ease;
}

.social a:hover {
  transform: translateY(-4px);
  background: rgba(255, 145, 77, 0.35);
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

.copyright {
  margin-top: 28px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 860px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }

  .brand p {
    max-width: none;
  }

  .footer-nav,
  .social {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
