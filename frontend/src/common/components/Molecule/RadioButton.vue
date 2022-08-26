<script setup lang="ts">
import Button from '../Atom/Button.vue'
import { ref, watch } from 'vue'

defineProps<{
  texts: string[]
}>()

const selected = ref(0)
const emit = defineEmits(['selected'])
watch(selected, (value) => {
  emit('selected', value)
})

const setSelected = (index: number) => {
  selected.value = index
}

const setColor = (index: number) => {
  if (selected.value === index) return 'green'
  return 'gray'
}
</script>

<template>
  <div class="flex gap-x-2">
    <Button
      v-for="(text, index) in texts"
      :key="text"
      rounded
      :color="setColor(index)"
      @click="setSelected(index)"
    >
      {{ text }}
    </Button>
  </div>
</template>
