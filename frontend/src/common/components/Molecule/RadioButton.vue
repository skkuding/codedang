<script setup lang="ts">
import Button from '../Atom/Button.vue'

defineProps<{
  texts: string[]
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex gap-x-2">
    <Button
      v-for="text in texts"
      :key="text"
      class="rounded-2xl px-3"
      style="color: white"
      :color="modelValue === text ? 'green' : 'gray'"
      @click="$emit('update:modelValue', text)"
    >
      {{ text }}
    </Button>
  </div>
</template>
