<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: 'blue' | 'white' | 'grey'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    color: 'blue',
    size: 'md'
  }
)

const colorClassMapper = {
  blue: 'border-blue',
  white: 'border-white',
  grey: 'border-grey'
}

const sizeClassMapper = {
  sm: 'border-2 h-4 w-4',
  md: 'border-4 h-8 w-8',
  lg: 'border-8 h-16 w-16'
}
</script>

<template>
  <div
    class="spinner"
    :class="[colorClassMapper[color], sizeClassMapper[size]]"
  />
</template>

<style scoped>
.spinner {
  border-style: solid;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
