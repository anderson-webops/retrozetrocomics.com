<script lang="ts" setup>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
</script>

<template>
  <footer>
    <h2>Contact</h2>
    <nav>
      <ul>
        <!--				<li> -->
        <!--					<a href="https://www.facebook.com/jacoba1100254352" target="_blank"> -->
        <!--						<FontAwesomeIcon :icon="['fab', 'facebook']" size="2x" /> -->
        <!--					</a> -->
        <!--				</li> -->
        <li>
          <a href="https://www.github.com/Jacoba1100254352" target="_blank">
            <FontAwesomeIcon :icon="['fab', 'github']" size="2x" />
          </a>
        </li>
        <!--				<li> -->
        <!--					<a href="https://www.instagram.com/jacoba1100254352" target="_blank"> -->
        <!--						<FontAwesomeIcon :icon="['fab', 'instagram']" size="2x" /> -->
        <!--					</a> -->
        <!--				</li> -->
      </ul>
    </nav>
  </footer>
</template>

<style scoped>
footer ul {
  display: flex;
  justify-content: space-around;
  list-style: none;
  padding: 20px 0 0;
}

a {
  text-decoration: none;
  color: black;
}
</style>
