<script setup lang="ts">
const route = useRoute("/stories/[slug]");
</script>

<template><StoryReader :slug="String(route.params.slug)" /></template>
