<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: string
  rounded?: boolean
  pressed?: boolean
}>()

const borderRadius = computed(() => {
  return props.rounded ? 'rounded-full' : 'rounded'
})

const backgroundColor = computed(() => {
  if (props.color === 'blue') {
    return props.pressed
      ? 'bg-blue-dark text-white'
      : 'bg-blue hover:bg-blue-dark text-white'
  } else if (props.color === 'gray') {
    return props.pressed
      ? 'bg-gray-dark text-white'
      : 'bg-gray hover:bg-gray-dark text-white'
  } else if (props.color === 'gray-dark') {
    return props.pressed
      ? 'bg-gray text-white'
      : 'bg-gray-dark hover:bg-gray text-white'
  } else if (props.color === 'white') {
    return props.pressed
      ? 'bg-gray-dark text-white'
      : 'bg-white hover:bg-gray-dark text-gray-dark hover:text-white border-gray border'
  } else if (props.color === 'secondary-white') {
    return 'bg-transparent hover:bg-[#204A60] border-white border text-white'
  } else if (props.color === 'dark-white') {
    return 'bg-transparent hover:bg-[#212529] border-white border text-white'
  } else if (props.color === 'page') {
    return 'bg-[#1F2937] hover:bg-[#334155] text-white'
  } else if (props.color === 'current-page') {
    return 'bg-[#6B7280] text-white'
  } else {
    return props.pressed
      ? 'bg-green-dark disabled:bg-green text-white'
      : 'bg-green hover:bg-green-dark disabled:bg-green text-white'
  }
})
</script>

<template>
  <button class="px-2 py-1" :class="[borderRadius, backgroundColor]">
    <slot />
  </button>
</template>
