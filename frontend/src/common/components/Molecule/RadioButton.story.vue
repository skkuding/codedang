<script setup lang="ts">
import { ref } from 'vue'
import RadioButton from './RadioButton.vue'

const filters = ['Latest', 'Ongoing']
const selectedFilter = ref(filters[0])
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="default">
      <RadioButton v-model="selectedFilter" :texts="filters" />
    </Variant>
  </Story>
</template>
