<script setup lang="ts">
defineProps<{
  color: 'red' | 'green' | 'blue'
}>()

const colorMapper = {
  red: 'bg-red',
  green: 'bg-green',
  blue: 'bg-blue'
}
</script>

<template>
  <div
    class="border-gray bg-gray-light flex h-8 w-fit items-center rounded-md border px-2"
  >
    <div :class="colorMapper[color]" class="mx-1 h-4 w-4 rounded-full" />
    <div class="text-gray-dark mx-2 font-bold">
      <slot />
    </div>
  </div>
</template>
