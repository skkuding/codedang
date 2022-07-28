<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'

const props = defineProps<{
  title: string
  titleColor?: string
}>()
defineEmits(['close'])

const ModalStyle = computed(() => {
  return props.titleColor === 'green' ? 'text-green' : 'text-gray'
})
</script>

<template>
  <div class="ml-auto mr-auto">
    <div class="fixed top-0 left-0 h-screen w-screen bg-black opacity-25"></div>

    <div
      class="relative z-50 h-full w-full rounded-lg bg-white p-2 text-center"
    >
      <IconoirCancel
        class="text-gray absolute right-0 cursor-pointer"
        @click="$emit('close')"
      />
    </div>
    <span :class="ModalStyle">{{ title }}</span>
    <div>
      <slot name="modal-content">default content</slot>
    </div>
  </div>
</template>
