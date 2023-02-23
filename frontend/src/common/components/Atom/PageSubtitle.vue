<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <h2 class="text-text-subtitle text-xl font-bold">{{ text }}</h2>
</template>
