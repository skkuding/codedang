<script setup lang="ts">
defineProps<{
  color?: 'green' | 'gray' | 'gray' | 'blue' | 'red'
  text: string
}>()

const colorMapper = {
  default: 'bg-black',
  green: 'bg-green',
  gray: 'bg-gray',
  blue: 'bg-blue',
  red: 'bg-red'
}

const textColorMapper = {
  default: 'text-black',
  green: 'text-green',
  gray: 'text-gray',
  blue: 'text-blue',
  red: 'text-red'
}
</script>

<template>
  <div class="flex items-center">
    <div
      class="aspect-square h-16 rounded-full"
      :class="colorMapper[color || 'default']"
    />
    <div
      class="-ml-8 truncate rounded-full bg-white px-2 text-2xl"
      :class="textColorMapper[color || 'default']"
    >
      {{ text }}
    </div>
  </div>
</template>
