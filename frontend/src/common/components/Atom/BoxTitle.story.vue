<script setup lang="ts">
import BoxTitle from './BoxTitle.vue'
</script>
<template>
  <Story>
    <BoxTitle>
      <template #title>Problems</template>
      <template #subtitle>
        Find problems with problem set and filters, and solve it!
      </template>
    </BoxTitle>
    <h2 class="mt-8 mb-2 text-lg">Another Example</h2>
    <BoxTitle>
      <template #title>
        🏆 SKKU Coding Platform
        <span class="text-[#FEB144]">Contests</span>
      </template>
      <template #subtitle>Compete with schoolmates & win the prizes!</template>
    </BoxTitle>
  </Story>
</template>
