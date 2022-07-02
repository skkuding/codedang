<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>Atom Component props : {{ msg }}</div>
</template>
