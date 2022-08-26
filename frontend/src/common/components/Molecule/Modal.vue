<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'

const props = defineProps<{
  title: string
  titleColor?: string
}>()
defineEmits(['close'])

const titleStyle = computed(() => {
  return props.titleColor === 'green' ? 'text-green' : 'text-gray'
})
</script>

<template>
  <div class="m-auto">
    <div class="fixed top-0 left-0 h-screen w-screen bg-black opacity-25"></div>
    <div
      class="relative z-50 h-full w-full rounded-lg bg-white p-2 text-center"
    >
      <IconoirCancel
        class="text-gray absolute right-4 top-4 cursor-pointer"
        @click="$emit('close')"
      />
      <div class="absolute top-0 bottom-0 right-0 left-0 m-auto h-fit w-fit">
        <div class="mx-auto my-2 w-fit"><slot name="modal-image" /></div>
        <div class="text-bold mb-4 text-center text-xl" :class="titleStyle">
          {{ title }}
        </div>
        <slot name="modal-content" />
      </div>
    </div>
  </div>
</template>
