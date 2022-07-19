<script setup lang="ts">
defineProps<{
  total: number
  currentIndex: number
}>()

defineEmits(['switch'])
</script>

<template>
  <div class="absolute left-1/2 bottom-5 z-10 -translate-x-1/2">
    <button
      v-for="(item, index) in total"
      :key="index"
      class="m-1 h-4 w-4 cursor-pointer rounded-full border-none bg-white opacity-50"
      :class="currentIndex === index ? 'opacity-100' : ''"
      @click="$emit('switch', index)"
    ></button>
  </div>
</template>
