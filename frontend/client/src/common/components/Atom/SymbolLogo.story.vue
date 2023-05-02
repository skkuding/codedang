<script setup lang="ts">
import SymbolLogo from './SymbolLogo.vue'
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant title="Sizing">
      <SymbolLogo class="w-32" />
    </Variant>
    <Variant title="Color">
      <SymbolLogo class="fill-green w-32" />
    </Variant>
  </Story>
</template>
