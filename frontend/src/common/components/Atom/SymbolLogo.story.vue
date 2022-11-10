<script setup lang="ts">
import SymbolLogo from './SymbolLogo.vue'
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant title="default">
      <SymbolLogo />
    </Variant>
    <Variant title="sizing">
      <SymbolLogo class="w-32" />
    </Variant>
  </Story>
</template>
