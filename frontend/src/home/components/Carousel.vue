<script setup lang="ts">
import CarouselItem from './CarouselItem.vue'
import CarouselIndicators from './CarouselIndicators.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  slides: string[]
}>()

let currentSlide = ref(0)
let slideInterval = ref(0)
let direction = ref('right')

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
  slideInterval.value = setInterval(() => {
    _next()
  }, 3000)
}
const stopSlideTimer = () => {
  clearInterval(slideInterval.value)
}
const switchSlide = (index: number) => {
  const step = index - currentSlide.value
  if (step > 0) {
    next(step)
  } else {
    prev(step)
  }
}

onMounted(() => {
  startSlideTimer()
})
onBeforeUnmount(() => {
  stopSlideTimer()
})
</script>
<template>
  <div class="flex justify-center">
    <div class="relative h-[400px] w-[900px] overflow-hidden">
      <carousel-indicators
        :total="slides.length"
        :current-index="currentSlide"
        @switch="(index) => switchSlide(index)"
      ></carousel-indicators>
      <carousel-item
        v-for="(slide, index) in slides"
        :key="`item-${index}`"
        :slide="slide"
        :current-slide="currentSlide"
        :index="index"
        :direction="direction"
        @mouseenter="stopSlideTimer"
        @mouseout="startSlideTimer"
      ></carousel-item>
    </div>
  </div>
</template>
