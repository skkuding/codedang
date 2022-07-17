<script setup lang="ts">
import Badge from './Badge.vue'
</script>

<template>
  <Story>
    <Badge color="green">
      <template #text>Badge</template>
    </Badge>
    <h2 class="mt-8 mb-2 text-lg">Another Example</h2>
    <Badge color="green">
      <template #text>Compile Error</template>
    </Badge>
  </Story>
</template>
