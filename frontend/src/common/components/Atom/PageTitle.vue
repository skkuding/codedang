<script setup lang="ts">
const props = defineProps<{
  text: string
  color?: string
}>()
const className = props.color == 'white' ? 'text-white' : 'text-text-title'
</script>

<template>
  <div :class="className" class="text-3xl font-bold">{{ text }}</div>
</template>
