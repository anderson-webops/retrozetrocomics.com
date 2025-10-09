<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <footer class="footer">
    <div class="footer__grid">
      <div class="footer__brand">
        <h2>Stay in the RetroZetro loop</h2>
        <p>
          Subscribe to the RetroZetro dispatch for exclusive concept art, panel breakdowns, and early access to
          upcoming arcs.
        </p>
        <form class="footer__form" @submit.prevent>
          <input aria-label="Email address" placeholder="Email address" type="email" />
          <button type="submit">Join the dispatch</button>
        </form>
      </div>

      <div class="footer__links">
        <h3>Elsewhere</h3>
        <ul>
          <li>
            <a href="https://www.github.com/Jacoba1100254352" target="_blank" rel="noreferrer">
              <FontAwesomeIcon :icon="['fab', 'github']" size="lg" />
              <span>GitHub</span>
            </a>
          </li>
          <li>
            <a href="mailto:retrozetrocomics@gmail.com">
              <span class="footer__icon">✉️</span>
              <span>Email</span>
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer__meta">
      <span>&copy; {{ new Date().getFullYear() }} RetroZetro Comics. Crafted with neon dreams.</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 2.5rem clamp(1.25rem, 3vw, 3rem);
  background: linear-gradient(180deg, rgba(16, 6, 30, 0.95), rgba(8, 2, 18, 0.95));
  border-top: 2px solid rgba(255, 145, 77, 0.4);
  color: #ffe9d6;
}

.footer__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
  align-items: flex-start;
}

.footer h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.footer p {
  margin: 0 0 1.25rem;
  line-height: 1.6;
  color: rgba(255, 233, 214, 0.78);
}

.footer__form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.footer__form input {
  flex: 1;
  min-width: 220px;
  border-radius: 999px;
  border: 1px solid rgba(255, 233, 214, 0.35);
  background: rgba(12, 3, 24, 0.65);
  color: #ffe9d6;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  outline: none;
}

.footer__form input::placeholder {
  color: rgba(255, 233, 214, 0.5);
}

.footer__form button {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-weight: 700;
  font-size: 0.75rem;
  background: linear-gradient(135deg, #ff914d, #ffb067);
  color: #2d1340;
  cursor: pointer;
  box-shadow: 0 12px 20px rgba(255, 145, 77, 0.45);
}

.footer__links h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #ffb067;
}

.footer__links ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.75rem;
}

.footer__links a {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  color: rgba(255, 233, 214, 0.78);
  text-decoration: none;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.footer__links a:hover {
  color: #ffb067;
}

.footer__icon {
  font-size: 1.2rem;
}

.footer__meta {
  margin-top: 2.5rem;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: rgba(255, 233, 214, 0.55);
}

@media (max-width: 640px) {
  .footer__form {
    flex-direction: column;
  }

  .footer__form input {
    width: 100%;
  }
}
</style>
