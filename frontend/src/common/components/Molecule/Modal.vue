<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'
import { OnClickOutside } from '@vueuse/components'
const props = defineProps<{
  title: string
  titleColor?: string
  // size?: string
}>()
defineEmits(['close'])

const titleStyle = computed(() => {
  return props.titleColor === 'green' ? 'text-green' : 'text-gray'
})
// const modalSize = computed(() => {
//   return (
//     'relative z-50 h-full w-full rounded-lg bg-white p-2 text-center ' +
//     props.size
//   )
// })
// const enter = computed(() => {
//   return props.title.replace('\n', '<br />')
// })
</script>

<template>
  <!-- FIXME: 모달 누적시 배경 진해지는 문제 고치기 -->
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
      <!-- FIXME: 모달 크기 수정 -->
      <div
        class="container h-full w-full overflow-hidden rounded-lg bg-white p-2 py-5 px-4 text-center"
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
    </OnClickOutside>
  </div>
</template>
