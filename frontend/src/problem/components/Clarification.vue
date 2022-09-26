<script setup lang="ts">
import { ref } from 'vue'
import IconSoundFilled from '~icons/ant-design/sound-filled'
import { useDraggable } from '@vueuse/core'

const visible = ref(false)
const el = ref<HTMLElement | null>(null)

const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 }
})
</script>

<template>
  <button
    ref="el"
    :style="style"
    class="item bg-gray fixed h-[200px] w-[200px] rounded-full"
    @click="visible = !visible"
  >
    <button
      class="bg-red absolute top-0.5 right-0.5 h-[50px] w-[50px] rounded-full font-bold text-white"
    >
      1
    </button>
    <div class="flex justify-center">
      <IconSoundFilled class="text-7xl text-white" />
    </div>
  </button>
  <div v-if="visible" class="bg-gray fixed h-96 w-96 overflow-auto">
    <pre>
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    </pre>
  </div>
</template>
