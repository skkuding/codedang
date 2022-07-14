<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  header?: string
  description?: string
  type?: string
  color?: string
  total?: number
  complete?: number
}>()
const width = (props.complete / props.total) * 100

const shadowColor = computed(() => {
  return props.type == 'problem'
    ? 'box-shadow: 0 4px 8px 4px #7a7c7b;'
    : `box-shadow: 0 4px 8px 4px ${props.color};`
})
const progressColor = computed(() => {
  return props.type == 'problem'
    ? 'background-color: #7a7c7b;'
    : `background-color: ${props.color};`
})
const progressWidth = computed(() => {
  return `width: ${width}%;`
})
</script>

<template>
  <div class="m-12 w-1/2 min-w-min rounded-lg p-12" :style="shadowColor">
    <div class="text-text-title text-xs">{{ header }}</div>
    <div class="text-text-title mb-2 text-2xl">{{ title }}</div>
    <div class="mb-4">{{ description }}</div>
    <!-- progress bar -->
    <div class="w-full text-right">
      {{ complete + ' / ' + total }}
      <span v-if="type == 'problem'">Problems</span>
      <div class="bg-gray-light relative h-6 w-full rounded-full">
        <div
          class="absolute h-6 rounded-full"
          :style="[progressColor, progressWidth]"
        ></div>
      </div>
    </div>
  </div>
</template>
