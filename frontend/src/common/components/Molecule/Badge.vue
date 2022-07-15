<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color: string
  text: string
}>()

const colorMapper: Record<string, string> = {
  red: 'bg-red',
  green: 'bg-green',
  blue: 'bg-blue'
}

const highlightColor = computed(() => {
  return colorMapper[props.color] || 'bg-gray-dark'
})

const textSize = computed(() => [
  props.text.length > 8 ? 'text-[18px]' : 'text-[22px]',
  props.text.length < 6 ? 'ml-6' : 'ml-2'
])
</script>

<template>
  <div
    class="border-gray bg-gray-light relative box-border flex h-14 w-40 rounded-md border p-1"
  >
    <div
      :class="highlightColor"
      class="margin top-0 bottom-0 my-auto ml-3 h-6 w-6 rounded-full"
    ></div>
    <div
      :class="textSize"
      class="text-gray-dark top-0 bottom-0 my-auto font-bold"
    >
      {{ text }}
    </div>
  </div>
</template>
