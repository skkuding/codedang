<script setup lang="ts">
import Button from './Button.vue'
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant>
      <Button color="green">Button</Button>
      <Button color="blue">Button</Button>
      <Button color="gray">Button</Button>
      <Button color="gray-dark">Button</Button>
    </Variant>
    <Variant>
      <Button color="green" outline>Button</Button>
      <Button color="blue" outline>Button</Button>
      <Button color="gray" outline>Button</Button>
      <Button color="gray-dark" outline>Button</Button>
    </Variant>
  </Story>
</template>
