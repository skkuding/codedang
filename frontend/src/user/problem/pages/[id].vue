<script setup lang="ts">
import Editor from '../components/Editor.vue'
defineProps<{
  id: number
}>()
</script>

<template>
  <Editor />
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
