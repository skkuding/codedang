<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <h1 class="text-text-title text-3xl font-bold">{{ text }}</h1>
</template>
