<script setup lang="ts">
const props = defineProps<{
  total?: number
  currentIndex?: number
}>()

const emit = defineEmits(['switch'])
</script>

<template>
  <div class="z-2 absolute left-1/2 bottom-6 -translate-x-1/2">
    <button
      v-for="(item, index) in total"
      :key="index"
      class="w-3.75 h-3.75 m-1 cursor-pointer rounded-lg border-none bg-[#fff] opacity-50"
      :class="{ active: props.currentIndex === index }"
      @click="emit('switch', index)"
    ></button>
  </div>
</template>

<style scoped>
.active {
  opacity: 1;
}
</style>
