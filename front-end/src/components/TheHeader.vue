<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";

const isExpanded = ref(false);

const links = [
  { name: "Home", path: "/" },
  { name: "Characters", path: "/characters" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const route = useRoute();

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function handleLinkClick() {
  isExpanded.value = false;
}
</script>

<template>
  <header class="site-header">
    <div class="nav-container">
      <RouterLink class="brand" to="/">
        <img
          alt="RetroZetro Comics logo"
          class="brand-mark"
          src="https://retrozetrocomics.s3.amazonaws.com/images/Original_Icon.png"
        />
        <span class="brand-copy">RetroZetro Comics</span>
      </RouterLink>

      <button
        class="hamburger"
        type="button"
        aria-label="Toggle navigation"
        :aria-expanded="isExpanded"
        @click="toggleMenu"
      >
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
      </button>

      <ul :class="{ expanded: isExpanded }" class="nav-links">
        <li
          v-for="link in links"
          :key="link.path"
          :class="{ active: route.path === link.path }"
          @click="handleLinkClick"
        >
          <RouterLink :to="link.path" class="nav-link">{{ link.name }}</RouterLink>
        </li>
      </ul>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: linear-gradient(135deg, #2f1057 0%, #632b90 70%, #ff914d 140%);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 12px 30px rgba(26, 9, 41, 0.35);
  padding: 0.75rem 1.5rem;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  position: relative;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  color: #ffeeda;
  font-family: "Poppins", "Segoe UI", sans-serif;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
}

.brand-mark {
  height: 48px;
  width: 48px;
  object-fit: contain;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.3));
}

.brand-copy {
  font-size: 1rem;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links li {
  position: relative;
}

.nav-link {
  color: #ffeeda;
  font-weight: 600;
  text-decoration: none;
  letter-spacing: 0.05em;
  transition: color 0.25s ease;
}

.nav-links li::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.35rem;
  width: 100%;
  height: 3px;
  border-radius: 999px;
  background: rgba(255, 233, 209, 0.5);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.25s ease;
}

.nav-links li:hover::after,
.nav-links li.active::after {
  transform: scaleX(1);
}

.nav-links li.active .nav-link,
.nav-link:hover {
  color: #fff7ef;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(18, 5, 34, 0.35);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.hamburger:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.7);
  outline-offset: 3px;
}

.hamburger .bar {
  display: block;
  width: 22px;
  height: 3px;
  margin: 0 auto;
  background: #ffeeda;
  border-radius: 999px;
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.hamburger .bar.open:nth-child(1) {
  transform: translateY(6px) rotate(45deg);
}

.hamburger .bar.open:nth-child(2) {
  opacity: 0;
}

.hamburger .bar.open:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

@media (max-width: 960px) {
  .brand-copy {
    font-size: 0.875rem;
  }

  .nav-links {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    align-items: flex-start;
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 12px);
    left: 0;
    right: 0;
    flex-direction: column;
    gap: 0.75rem;
    background: rgba(16, 5, 30, 0.92);
    border-radius: 18px;
    padding: 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 24px 40px rgba(12, 3, 24, 0.5);
    display: none;
    z-index: 5;
  }

  .nav-links.expanded {
    display: flex;
  }

  .nav-links li::after {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
</style>
