<script setup lang="ts">
import { computed } from 'vue'
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
  return props.borderColor === 'gray' ? 'border-gray' : 'border-green'
})

const textColorStyle = computed(() => {
  return props.borderColor === 'gray' ? 'text-gray-dark' : 'text-green'
})
</script>

<template>
  <div
    class="flex cursor-pointer border p-3 hover:border-2"
    :class="borderColorStyle"
  >
    <img v-if="img" :src="img" class="aspect-square w-16" />
    <div class="w-full pl-2">
      <div class="flex flex-row pl-2">
        <div class="text-text-subtitle w-2/3 text-xl font-bold">
          {{ title }}
        </div>
        <div class="hidden w-1/3 text-right md:block">
          {{ additionalText }}
        </div>
      </div>
      <div class="flex flex-row pl-2">
        <div class="text-gray-dark w-2/3">
          {{ description }}
        </div>
        <!-- when screen size is 1440px -->
        <div class="hidden w-1/3 text-right md:block" :class="textColorStyle">
          {{ coloredText }}
        </div>
        <!-- when screen size is smaller than 768px -->
        <div class="block w-1/3 text-right md:hidden" :class="textColorStyle">
          {{ coloredTextShort || coloredText }}
        </div>
      </div>
    </div>
  </div>
</template>
