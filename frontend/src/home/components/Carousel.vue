<script setup lang="ts">
import { ref } from 'vue'
import { useIntervalFn } from '@vueuse/core'

const props = defineProps<{
  slides: string[]
}>()

const currentSlide = ref(0)
const direction = ref<'right' | 'left'>('right')

const switchSlide = (index: number) => {
  direction.value = index - currentSlide.value > 0 ? 'right' : 'left'
  currentSlide.value = index
  resume()
}

const { pause, resume } = useIntervalFn(() => {
  switchSlide((currentSlide.value + 1) % props.slides.length)
}, 3000)
</script>

<template>
  <div class="flex justify-center">
    <div class="relative h-[600px] w-full overflow-hidden">
      <div class="absolute left-1/2 bottom-5 z-10 -translate-x-1/2">
        <button
          v-for="index in slides.length"
          :key="index"
          class="m-1 h-4 w-4 cursor-pointer rounded-full border-none bg-white opacity-50"
          :class="currentSlide === index - 1 ? 'opacity-100' : ''"
          @click="switchSlide(index - 1)"
          @mouseenter="pause"
          @mouseout="resume"
        ></button>
      </div>
      <transition
        class="absolute inset-0"
        enter-active-class="transition-transform duration-1000"
        leave-active-class="transition-transform duration-1000"
        :enter-from-class="
          direction === 'right' ? 'translate-x-full' : '-translate-x-full'
        "
        :leave-to-class="
          direction === 'right' ? '-translate-x-full' : 'translate-x-full'
        "
        @mouseenter="pause"
        @mouseout="resume"
      >
        <img
          :key="currentSlide"
          class="h-full w-full"
          :src="slides[currentSlide]"
        />
      </transition>
    </div>
  </div>
</template>
