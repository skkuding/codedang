<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div class="text-text-subtitle text-xl font-bold">{{ text }}</div>
</template>
