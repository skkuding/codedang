<script setup lang="ts">
import IconoirCancel from '~icons/iconoir/cancel'
import { OnClickOutside } from '@vueuse/components'

defineProps<{
  modalTitle?: string
}>()

defineEmits(['close'])
</script>

<template>
  <div
    class="fixed top-0 left-0 right-0 bottom-0 z-50 m-auto flex items-center justify-center"
  >
    <div
      class="fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-50"
    ></div>
    <OnClickOutside
      class="absolute m-auto h-full max-h-full w-full"
      @trigger="$emit('close')"
    >
      <div
        class="container h-full w-full overflow-hidden rounded-lg bg-white p-2 py-5 px-4 text-center"
      >
        <IconoirCancel
          class="text-gray absolute right-4 top-4 z-50 cursor-pointer"
          @click="$emit('close')"
        />

        <div class="absolute top-0 bottom-0 right-0 left-0 m-auto p-10">
          <div class="mx-auto my-2 w-fit"><slot name="modal-image" /></div>
          <div class="text-bold mb-4 text-center text-xl">
            {{ modalTitle }}
          </div>
          <slot name="modal-content" />
        </div>
      </div>
    </OnClickOutside>
  </div>
</template>
