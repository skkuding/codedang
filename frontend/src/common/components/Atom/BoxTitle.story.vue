<script setup lang="ts">
import BoxTitle from './BoxTitle.vue'
</script>

<template>
  <Story :layout="{ type: 'grid', width: '100%' }">
    <Variant title="default">
      <BoxTitle>
        <template #title>Problems</template>
        <template #subtitle>
          Find problems with problem set and filters, and solve it!
        </template>
      </BoxTitle>
    </Variant>
    <Variant title="Another Example">
      <BoxTitle>
        <template #title>
          🏆 SKKU Coding Platform
          <span class="text-[#FEB144]">Contests</span>
        </template>
        <template #subtitle>
          Compete with schoolmates & win the prizes!
        </template>
      </BoxTitle>
    </Variant>
  </Story>
</template>
