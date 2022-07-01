<script setup lang="ts">
import MyComponent from '../../components/MyComponent.vue'
defineProps<{
  contestId: number
}>()
</script>

<template>
  <div>This is contest problem page : id = {{ contestId }}</div>
  <MyComponent msg="contest problem!" />
</template>
