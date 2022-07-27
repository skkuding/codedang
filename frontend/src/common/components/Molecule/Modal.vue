<script setup lang="ts">
import { reactive, computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  titleColor?: string
}>()
const emit = defineEmits(['close'])

const ModalStyle = computed(() => {
  if (props.titleColor == 'green') {
    return 'text-center text-xl text-green'
  } else {
    return 'text-center text-xl text-gray'
  }
})
const isModalVisible = ref(false)
</script>

<template>
  <div class="ml-auto mr-auto">
    <div class="fixed top-0 left-0 h-screen w-screen bg-black opacity-25"></div>

    <div
      class="relative z-50 h-full w-full rounded-lg bg-white p-2 text-center"
    >
      <div class="my-2 flex justify-center">
        <slot name="modal-image"></slot>
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
  </div>
</template>
