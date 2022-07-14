<script setup lang="ts">
import Badge from '@/common/components/Molecule/Badge.vue'
</script>

<template>
  <Story>
    <Badge endtime="12:30:50" :ended="true" />
    <h2 class="mt-8 mb-2 text-lg">Another Example</h2>
    <Badge endtime="14:00:00" :ended="false" />
  </Story>
</template>
