<script setup lang="ts">
import CodingPlatformLogo from './CodingPlatformLogo.vue'
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant title="default">
      <CodingPlatformLogo />
    </Variant>
    <Variant title="sizing">
      <CodingPlatformLogo class="w-32" />
    </Variant>
  </Story>
</template>
