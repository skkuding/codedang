<script setup lang="ts">
import { ref } from 'vue'
import IconSoundFilled from '~icons/ant-design/sound-filled'
import { useDraggable } from '@vueuse/core'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import { useWindowSize } from '@vueuse/core'
import { watch } from 'vue'

const el = ref<HTMLElement | null>(null)

const date = new Date().toLocaleString()

const visible = ref<boolean>(false)

const from = ref({ x: 0, y: 0 })

const window = useWindowSize()

const { x, y, style } = useDraggable(el, {
  initialValue: { x: 500, y: 60 }
})

const ELEMENT_WIDTH = 54
const ELEMENT_HEIGHT = 54

watch([x, window.width], () => {
  x.value = Math.max(0, Math.min(window.width.value - ELEMENT_WIDTH, x.value))
})

watch([y, window.height], () => {
  y.value = Math.max(0, Math.min(window.height.value - ELEMENT_HEIGHT, y.value))
})

const noticeList = [
  {
    title:
      '무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  },
  {
    title:
      '무슨무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  },
  {
    title:
      '무슨무슨무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  },
  {
    title:
      '무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  },
  {
    title:
      '무슨무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  },
  {
    title:
      '무슨무슨무슨 버그가 발견되었으니 이렇게 저렇게 고쳐서 어떻게 해결하시길 바랍니다.'
  }
]
</script>

<template>
  <button
    ref="el"
    :style="style"
    class="item bg-gray-dark fixed z-10 h-[54px] w-[54px] rounded-full shadow-lg"
    @pointerdown="
      (e) => {
        from.x = e.pageX
        from.y = e.pageY
      }
    "
    @pointerup="
      (e) => {
        if (from.x === e.pageX && from.y === e.pageY) {
          visible = !visible
        }
      }
    "
  >
    <div
      class="bg-red absolute top-0.5 right-0.5 h-[15px] w-[15px] rounded-full text-xs font-bold text-white"
    >
      1
    </div>
    <div class="flex justify-center">
      <IconSoundFilled class="hover:text-red text-xl text-white" />
    </div>
  </button>
  <div
    v-if="visible"
    class="bg-white-light border-gray fixed m-auto h-96 w-1/2 overflow-auto rounded-md border border-solid py-2 px-6"
  >
    <div class="mb-3">
      <PageSubtitle text="Notice" class="ml-12" />
    </div>
    <div
      v-for="(item, index) in noticeList.slice().reverse()"
      :key="index"
      class="mb-4 flex gap-6 text-sm"
    >
      <IconSoundFilled v-if="index == 0" class="text-red text-xl" />
      <IconSoundFilled v-else class="text-xl text-black" />
      <div class="mr-auto w-72">{{ item.title }}</div>
      <div class="m-auto hidden md:inline-block">{{ date }}</div>
    </div>
    <Button class="w-full" outline color="gray-dark" @click="visible = false">
      Close
    </Button>
  </div>
</template>
