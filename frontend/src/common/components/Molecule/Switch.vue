<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  label?: string
  modelValue: boolean
}>()

const emit = defineEmits(['switchdata'])

const sendSwitchData = () => {
  emit('switchdata', data)
}

const data = ref(props.modelValue)
</script>

<template>
  <label class="flex items-center gap-2">
    <div class="text-text-title font-bold">{{ label }}</div>
    <input
      v-model="data"
      type="checkbox"
      role="switch"
      class="border-gray before:bg-gray checked:before:bg-green checked:border-green grid h-6 w-12 cursor-pointer appearance-none rounded-full border px-1 before:my-auto before:h-4 before:w-4 before:rounded-full before:transition checked:before:translate-x-5"
      @change="sendSwitchData()"
    />
  </label>
</template>
