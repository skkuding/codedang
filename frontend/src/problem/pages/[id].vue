<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
defineProps<{
  id: number
}>()
</script>

<template>
  <div>This is problem detail page : id = {{ id }}</div>
  <MyComponent msg="problem detail!" />
</template>
