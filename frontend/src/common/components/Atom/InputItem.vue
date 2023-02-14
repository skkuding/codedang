<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  placeholder?: string
  shadow?: boolean
  modelValue: string
  message?: string
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
  <div class="flex flex-col gap-1">
    <input
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :class="shadowClass"
      class="rounded py-1 px-3 outline-none"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    />
    <p v-show="message" class="text-red text-xs font-bold">
      {{ message }}
    </p>
  </div>
</template>
