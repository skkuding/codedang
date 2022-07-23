<script setup lang="ts">
import { computed, ref, watch } from 'vue'
defineProps<{
  label: string
}>()

const switchdata = ref(false)

const emit = defineEmits(['switchdata'])
watch(
  () => switchdata.value,
  (newValue) => {
    emit('switchdata', newValue)
  }
)
</script>

<template>
  <label class="flex items-center gap-2">
    <div class="text-text-title font-bold">{{ label }}</div>
    <input
      v-model="switchdata"
      type="checkbox"
      role="switch"
      class="border-gray before:bg-gray checked:before:bg-green checked:border-green grid h-6 w-12 cursor-pointer appearance-none rounded-full border px-1 before:my-auto before:h-4 before:w-4 before:rounded-full before:transition checked:before:translate-x-5"
    />
  </label>
</template>
