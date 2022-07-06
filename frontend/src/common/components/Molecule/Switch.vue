<script setup lang="ts">
import { computed, ref, watch } from 'vue'
defineProps<{
  label: string
}>()

var switchdata = ref(0)

const switchToggle = computed(() =>
  switchdata.value == 0 ? 'border-gray' : 'border-green'
)
const emit = defineEmits(['switchdata'])
watch(
  () => switchdata.value,
  (newValue) => {
    emit('switchdata', newValue)
  }
)
</script>

<template>
  <div class="flex">
    <div class="text-text-title mr-2 font-bold">{{ label }}</div>
    <div
      :class="switchToggle"
      class="relative flex h-6 w-12 rounded-full border-2"
      @click="switchdata == 0 ? (switchdata = 1) : (switchdata = 0)"
    >
      <div
        v-if="switchdata == 0"
        class="bg-gray absolute left-0 top-0 bottom-0 my-auto mr-4 ml-1.5 inline-block h-3 w-3 rounded-full border-none"
      ></div>
      <div
        v-else
        class="bg-green absolute right-0 top-0 bottom-0 my-auto ml-4 mr-1.5 inline-block h-3 w-3 rounded-full border-none"
      ></div>
    </div>
  </div>
</template>
