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
}, 5000)
</script>

<template>
  <div class="bg-gray/50 relative h-[600px] w-full overflow-hidden">
    <div class="absolute left-1/2 bottom-5 z-10 flex -translate-x-1/2 gap-2">
      <button
        v-for="index in slides.length"
        :key="index"
        class="h-4 w-4 cursor-pointer rounded-full border-none"
        :class="currentSlide === index - 1 ? 'bg-white' : 'bg-white/50'"
        @click="switchSlide(index - 1)"
        @mouseenter="pause"
        @mouseout="resume"
      />
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
      <div
        :key="currentSlide"
        class="bg-cover bg-center"
        :style="{ backgroundImage: `url(${slides[currentSlide]})` }"
      >
        <img
          class="h-full w-full object-contain backdrop-blur"
          :src="slides[currentSlide]"
        />
      </div>
    </transition>
  </div>
</template>
