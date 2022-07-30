<script setup lang="ts">
import Switch from './Switch.vue'
import { ref } from 'vue'

const data = ref(false)
</script>

<template>
  <Story>
    <Switch v-model="data" label="Toggle me!" />
    <p>Current value: {{ data }}</p>
  </Story>
</template>
