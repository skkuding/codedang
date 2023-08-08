<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="w-full rounded-lg border border-slate-50 p-5 text-slate-600">
    <h2 class="border-b border-slate-50 pb-3 text-xl font-bold capitalize">
      {{ title }}
    </h2>
    <div>
      <slot />
    </div>
  </div>
</template>
