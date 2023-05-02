<script setup lang="ts">
defineProps<{
  color?: 'white' | 'slate'
}>()

const colorMapper = {
  white: 'text-text-title hover:bg-gray/30 active:bg-gray/50',
  slate: 'text-white hover:bg-slate-700/30 active:bg-slate-700/50'
}
</script>

<template>
  <li
    :class="colorMapper[color || 'white']"
    class="w-full cursor-pointer rounded-lg px-2 py-1 font-medium"
  >
    <slot />
  </li>
</template>
