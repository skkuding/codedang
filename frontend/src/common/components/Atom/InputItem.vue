<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  placeholder?: string
  shadow?: boolean
  required?: boolean
  isValid?: string
  modelValue: string | number
}>()

defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const shadowClass = computed(() =>
  props.shadow
    ? 'shadow-md focus:shadow-green'
    : 'border-gray border focus:border-green focus:ring-1 focus:ring-green'
)
</script>

<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :class="shadowClass"
    class="placeholder-gray rounded px-3 py-1 outline-none"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
  <p v-show="required && !modelValue" class="text-red text-xs font-bold">
    {{ placeholder + ' is required' }}
  </p>
  <p
    v-show="modelValue !== '' && isValid !== '' && !modelValue"
    class="text-red text-xs font-bold"
  >
    {{ isValid }}
  </p>
</template>
