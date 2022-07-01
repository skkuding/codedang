<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
defineProps<{
  problemId: number
}>()
</script>

<template>
  <div>This is problem detail page : id = {{ problemId }}</div>
  <MyComponent msg="problem detail!" />
</template>
