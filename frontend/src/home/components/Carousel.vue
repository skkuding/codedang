<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { computed } from 'vue'

const props = defineProps<{
  slides: string[]
}>()

const currentSlide = ref(0)
let slideInterval = 0
const direction = ref('right')

const setCurrentSlide = (index: number) => {
  currentSlide.value = index
}
const prev = (step = -1) => {
  const index =
    currentSlide.value > 0 ? currentSlide.value + step : props.slides.length - 1
  setCurrentSlide(index)
  direction.value = 'left'
  startSlideTimer()
}
const _next = (step = 1) => {
  const index =
    currentSlide.value < props.slides.length - 1 ? currentSlide.value + step : 0
  setCurrentSlide(index)
  direction.value = 'right'
}
const next = (step = 1) => {
  _next(step)
  startSlideTimer()
}
const startSlideTimer = () => {
  stopSlideTimer()
  slideInterval = setInterval(() => {
    _next()
  }, 3000)
}
const stopSlideTimer = () => {
  clearInterval(slideInterval)
}
const switchSlide = (index: number) => {
  const step = index - currentSlide.value
  if (step > 0) {
    next(step)
  } else {
    prev(step)
  }
}

const transitionEffect = computed(() => {
  return direction.value === 'right' ? 'slide-out' : 'slide-in'
})

onMounted(() => {
  startSlideTimer()
})
onBeforeUnmount(() => {
  stopSlideTimer()
})
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
        ></button>
      </div>
      <transition
        v-for="(slide, index) in slides"
        v-show="currentSlide === index"
        :key="`item-${index}`"
        :name="transitionEffect"
        class="absolute inset-0"
        @mouseenter="stopSlideTimer"
        @mouseout="startSlideTimer"
      >
        <div>
          <img :src="slide" class="h-full w-full" />
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.slide-in-enter-active,
.slide-in-leave-active,
.slide-out-enter-active,
.slide-out-leave-active {
  transition: all 1s ease-in-out;
}
.slide-in-enter-from {
  transform: translateX(-100%);
}
.slide-in-leave-to {
  transform: translateX(100%);
}
.slide-out-enter-from {
  transform: translateX(100%);
}
.slide-out-leave-to {
  transform: translateX(-100%);
}
</style>
