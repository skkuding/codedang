<script setup lang="ts">
const props = defineProps<{
  text: string
  color?: string
}>()
const className = props.color == 'white' ? 'text-white' : 'text-text-subtitle'
</script>

<template>
  <div :class="className" class="text-xl font-bold">{{ text }}</div>
</template>
