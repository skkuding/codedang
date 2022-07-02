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

const borderColorClass = computed(() => {
  return props.borderColor === 'gray' ? 'border-gray' : 'border-green'
})
</script>

<template>
  <div
    class="mx-40 flex cursor-pointer border p-3 hover:shadow"
    :class="borderColorClass"
  >
    <img v-if="img" :src="img" class="aspect-square w-16" />
    <div class="flex w-full pl-2">
      <div class="relative w-full pl-2">
        <div class="text-xl font-bold">{{ title }}</div>
        <div class="text-gray-dark">
          {{ description }}
        </div>
      </div>
      <div class="relative w-1/2">
        <div class="hidden text-right md:block">
          {{ additionalText }}
        </div>
        <!-- when screen size is 1440px -->
        <div
          class="text-green absolute bottom-0 right-0 hidden text-right md:block"
        >
          {{ coloredText }}
        </div>
        <!-- when screen size is smaller than 768px -->
        <div
          class="text-green absolute bottom-0 right-0 block text-right md:hidden"
        >
          {{ coloredTextShort || coloredText }}
        </div>
      </div>
    </div>
  </div>
</template>
