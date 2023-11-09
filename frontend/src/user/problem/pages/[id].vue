<script setup lang="ts">
import Header from '../components/Header.vue'
import Navigator from '../components/Navigator.vue'

defineProps<{
  id: string
}>()
</script>

<template>
  <Header />
  <Navigator :id="id" />
  <RouterView />
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
