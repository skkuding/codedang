<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  placeholder?: string
  required?: boolean
  shadow?: boolean
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const shadowClass = computed(() =>
  props.shadow
    ? 'shadow-md focus:shadow-green'
    : 'border-gray border focus:border-green focus:ring-1 focus:ring-green'
)
</script>

<template>
  <input
    :value="modelValue"
    :placeholder="placeholder"
    :class="[shadowClass, $attrs.class]"
    class="rounded py-1 px-3 outline-none"
    @input="
      $emit('update:modelValue', ($event.target as HTMLInputElement).value)
    "
  />
  <div v-show="required && !modelValue" class="text-red pt-1 text-xs font-bold">
    {{ placeholder + ' is required' }}
  </div>
</template>
