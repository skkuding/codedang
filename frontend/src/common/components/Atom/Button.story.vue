<script setup lang="ts">
import Button from './Button.vue'
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="Color">
      <Button color="green">Button</Button>
      <Button color="blue">Button</Button>
      <Button color="indigo">Button</Button>
      <Button color="gray">Button</Button>
      <Button color="gray-dark">Button</Button>
      <Button color="red">Button</Button>
      <Button color="white">Button</Button>
    </Variant>
    <Variant title="Outline">
      <Button outline color="green">Button</Button>
      <Button outline color="blue">Button</Button>
      <Button outline color="indigo">Button</Button>
      <Button outline color="gray">Button</Button>
      <Button outline color="gray-dark">Button</Button>
      <Button outline color="red">Button</Button>
      <Button outline color="white">Button</Button>
    </Variant>
    <Variant title="Pressed">
      <Button pressed color="green">Button</Button>
      <Button pressed color="blue">Button</Button>
      <Button pressed color="indigo">Button</Button>
      <Button pressed color="gray">Button</Button>
      <Button pressed color="gray-dark">Button</Button>
      <Button pressed color="red">Button</Button>
      <Button pressed color="white">Button</Button>
      <Button pressed outline color="green">Button</Button>
      <Button pressed outline color="blue">Button</Button>
      <Button pressed outline color="indigo">Button</Button>
      <Button pressed outline color="gray">Button</Button>
      <Button pressed outline color="gray-dark">Button</Button>
      <Button pressed outline color="red">Button</Button>
      <Button pressed outline color="white">Button</Button>
    </Variant>
  </Story>
</template>
