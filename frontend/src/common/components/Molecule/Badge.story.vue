<script setup lang="ts">
import Badge from './Badge.vue'
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="green">
      <Badge color="green">Badge</Badge>
    </Variant>
    <Variant title="red">
      <Badge color="red">Compile Error</Badge>
    </Variant>
    <Variant title="blue">
      <Badge color="blue">Passed</Badge>
    </Variant>
  </Story>
</template>
