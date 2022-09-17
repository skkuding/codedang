<script setup lang="ts">
import Button from './Button.vue'
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="Color">
      <Button color="green">Button</Button>
      <Button color="blue">Button</Button>
      <Button color="gray">Button</Button>
      <Button color="gray-dark">Button</Button>
    </Variant>
    <Variant title="Rounded">
      <Button rounded>Button</Button>
    </Variant>
    <Variant title="Pressed">
      <Button pressed>Button</Button>
    </Variant>
  </Story>
</template>
