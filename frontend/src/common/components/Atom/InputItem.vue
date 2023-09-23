<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue'

const props = defineProps<{
  placeholder?: string
  shadow?: boolean
  required?: boolean
  error?: string
  modelValue?: T
}>()

defineEmits<{
  (e: 'update:modelValue', value: T): void
}>()

const shadowClass = computed(() =>
  props.shadow
    ? 'shadow-md focus:shadow-green'
    : 'border-gray border focus:border-blue focus:ring-1 focus:ring-blue'
)

const errorClass = computed(() => (props.error ? 'border-red' : ''))
</script>

<template>
  <input
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :class="shadowClass + ' ' + errorClass"
    class="placeholder-gray rounded px-3 py-1 outline-none"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
  <p v-show="required && modelValue" class="text-red text-xs font-bold">
    {{ placeholder + ' is required' }}
  </p>
  <p v-show="error" class="text-red mt-1 text-xs">
    {{ error }}
  </p>
</template>
