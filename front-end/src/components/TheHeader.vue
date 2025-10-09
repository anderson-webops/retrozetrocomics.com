<script lang="ts" setup>
import { ref } from "vue";

const isExpanded = ref(false);
const activeLink = ref("Home");

const links = ref([
  { name: "Home", path: "/" },
  { name: "Characters", path: "/characters" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
]);

function toggleMenu() {
  isExpanded.value = !isExpanded.value;
}

function setActiveLink(linkName: string) {
  activeLink.value = linkName;
  isExpanded.value = false; // Close the menu after a link is clicked
}
</script>

<template>
  <header class="relative overflow-hidden rounded-t-[18px] border-b border-white/10 bg-white/5 py-4">
    <div class="absolute inset-0 bg-gradient-to-r from-[#ff914d]/20 via-transparent to-[#ffcf99]/20" />
    <nav class="relative mx-auto flex max-w-3xl items-center justify-center gap-6 px-6">
      <button class="hamburger" @click="toggleMenu" aria-label="Toggle navigation">
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
        <span :class="{ open: isExpanded }" class="bar" />
      </button>
      <ul :class="{ expanded: isExpanded }" class="nav-links">
        <li
          v-for="link in links"
          :key="link.path"
          :class="{ active: activeLink === link.name }"
          @click="setActiveLink(link.name)"
        >
          <RouterLink :to="link.path" class="nav-link">
            {{ link.name }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.flex-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 20px;
  position: relative;
}

.nav-links {
  display: flex;
  gap: 26px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-link {
  position: relative;
  display: inline-block;
  padding: 0.35rem 0;
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  transition: color 0.3s ease;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -0.45rem;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #ff914d, #ffc389);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-links li.active .nav-link,
.nav-link:hover {
  color: #ffffff;
}

.nav-links li.active .nav-link::after,
.nav-link:hover::after {
  transform: scaleX(1);
}

.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.bar {
  width: 28px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ff914d, #ffc389);
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.bar.open:nth-child(1) {
  transform: translateY(8px) rotate(-45deg);
}

.bar.open:nth-child(2) {
  opacity: 0;
}

.bar.open:nth-child(3) {
  transform: translateY(-8px) rotate(45deg);
}

@media (max-width: 960px) {
  .hamburger {
    display: flex;
    position: absolute;
    left: 1.5rem;
    top: 50%;
    transform: translateY(-50%);
  }

  .nav-links {
    position: absolute;
    top: calc(100% + 1.25rem);
    left: 50%;
    transform: translateX(-50%);
    flex-direction: column;
    align-items: center;
    gap: 18px;
    width: calc(100% - 3rem);
    padding: 1.5rem;
    border-radius: 18px;
    background: rgba(15, 6, 25, 0.88);
    border: 1px solid rgba(255, 145, 77, 0.35);
    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
    display: none;
  }

  .nav-links.expanded {
    display: flex;
  }
}
</style>
