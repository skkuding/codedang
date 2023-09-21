<script setup lang="ts">
defineProps<{ isActive?: boolean }>()
</script>

<template>
  <button
    type="button"
    class="hover:text-text rounded-md p-1.5 hover:bg-slate-50 hover:bg-opacity-60"
    :class="isActive && 'bg-slate-50 bg-opacity-60'"
  >
    <slot />
  </button>
</template>
