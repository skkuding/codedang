<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="text-text-title text-3xl font-bold">{{ text }}</div>
</template>
