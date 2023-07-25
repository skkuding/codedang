<script setup lang="ts">
defineProps<{
  text: string
}>()
</script>

<template>
  <div v-dompurify-html="text" class="prose lg:prose-xl mt-10" />
</template>
