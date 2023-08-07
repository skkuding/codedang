<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
  label?: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const modelValue = useVModel(props, 'modelValue', emit)

const switchData = () => {
  modelValue.value = !modelValue.value
}
</script>

<template>
  <label class="flex items-center gap-2">
    <div class="text-text-title font-bold">{{ label }}</div>
    <button
      role="switch"
      class="flex h-6 w-12 items-center justify-center rounded-full border hover:opacity-70 active:opacity-50"
      :class="modelValue ? 'border-green' : 'border-gray'"
      @click="switchData"
    >
      <span
        class="inline-block h-4 w-4 rounded-full transition-transform"
        :class="
          modelValue ? 'bg-green translate-x-3' : 'bg-gray -translate-x-3'
        "
      />
    </button>
  </label>
</template>
