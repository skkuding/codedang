<script setup lang="ts">
import CarouselItem from './CarouselItem.vue'
import CarouselIndicators from './CarouselIndicators.vue'
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{
  slides: any
  controls: any
  interval: any
}>()

let currentSlide = ref(0)
let slideInterval = null
let direction = ref('right')

const setCurrentSlide = (index: any) => {
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
  }, props.interval)
}
const stopSlideTimer = () => {
  clearInterval(slideInterval)
}
const switchSlide = (index) => {
  const step = index - currentSlide.value
  console.log(step)
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
  <div class="carousel">
    <div class="carousel-inner">
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

<style scoped>
.carousel {
  display: flex;
  justify-content: center;
}
.carousel-inner {
  position: relative;
  width: 900px;
  height: 400px;
  overflow: hidden;
}
</style>
