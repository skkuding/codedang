<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>Organism Component props : {{ msg }}</div>
</template>
