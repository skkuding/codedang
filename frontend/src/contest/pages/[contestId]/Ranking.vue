<script setup lang="ts">
import MyComponent from '../../components/MyComponent.vue'
defineProps<{
  contestId: number
}>()
</script>

<template>
  <div>This is contest ranking page : id = {{ contestId }}</div>
  <MyComponent msg="contest ranking!" />
</template>
