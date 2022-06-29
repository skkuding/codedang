<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>Molecule Component props : {{ msg }}</div>
</template>
