<script setup lang="ts">
import { computed } from 'vue'

type Color = 'red' | 'green' | 'blue'

const props = defineProps<{
  color: Color
}>()

const colorMapper: Record<string, string> = {
  red: 'bg-red',
  green: 'bg-green',
  blue: 'bg-blue'
}

const highlightColor = computed(() => {
  return colorMapper[props.color] || 'bg-gray-dark'
})
</script>

<template>
  <div
    class="border-gray bg-gray-light relative box-border flex h-8 w-fit rounded-md border px-2"
  >
    <div class="my-auto w-6">
      <div :class="highlightColor" class="m-auto h-4 w-4 rounded-full"></div>
    </div>
    <div class="text-gray-dark my-auto mx-2 font-bold">
      <slot />
    </div>
  </div>
</template>
