<script setup lang="ts">
import Sidebar from './Sidebar.vue'
</script>

<template>
  <Story>
    <Variant title="Basic">
      <Sidebar />
    </Variant>
    <Variant title="Group">
      <Sidebar group color="blue" />
    </Variant>
  </Story>
</template>
