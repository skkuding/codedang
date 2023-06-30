<script setup lang="ts">
import { computed } from 'vue'
import PageSubtitle from '../Atom/PageSubtitle.vue'

type BorderColor = 'gray' | 'green'
const props = defineProps<{
  borderColor?: BorderColor
  img?: string
  title: string // left-top
  description?: string // left-bottom
  additionalText?: string // right-top
  coloredText?: string // right-bottom
  coloredTextShort?: string // right-bottom
}>()

const borderColorStyle = computed(() => {
  return props.borderColor === 'gray'
    ? 'border-gray outline-gray'
    : 'border-green outline-green'
})

const textColorStyle = computed(() => {
  return props.borderColor === 'gray' ? 'text-gray-dark' : 'text-green'
})
</script>

<template>
  <div
    class="flex cursor-pointer items-center gap-4 border p-3 hover:outline hover:outline-1"
    :class="borderColorStyle"
  >
    <img v-if="img" :src="img" class="h-16 w-16" />
    <div class="flex grow flex-col justify-between gap-2 md:flex-row">
      <div class="flex flex-col justify-between">
        <PageSubtitle :text="title" />
        <p class="text-gray-dark">
          {{ description }}
        </p>
      </div>
      <div class="flex flex-col items-end justify-between">
        <p class="text-text-subtitle font-bold">
          {{ additionalText }}
        </p>
        <p :class="textColorStyle">
          {{ coloredTextShort || coloredText }}
        </p>
      </div>
    </div>
  </div>
</template>
