<script setup lang="ts">
import RadioButton from './RadioButton.vue'
import { ref } from 'vue'

const texts = ['Latest', 'Ongoing']
const selected = ref()
const setSelected = (index: number) => {
  selected.value = index
}
</script>

<template>
  <Story :layout="{ type: 'grid' }">
    <Variant title="default">
      <RadioButton :texts="texts" @selected="setSelected" />
    </Variant>
  </Story>
</template>
