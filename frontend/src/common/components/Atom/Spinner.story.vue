<script setup lang="ts">
import Spinner from './Spinner.vue'
</script>

<template>
  <Story>
    <Variant title="size">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Variant>
    <Variant title="color">
      <Spinner color="blue" />
      <Spinner color="white" />
      <Spinner color="grey" />
    </Variant>
  </Story>
</template>
