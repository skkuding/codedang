<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import CarouselItem from './CarouselItem.vue'
import CarouselIndicators from './CarouselIndicators.vue'

const props = defineProps<{
  slides: Array<any>
}>()

let currentSlide = 0
let slideInterval = 0
let direction = 'right'

// 현재 슬라이드 지정
const setCurrentSlide = (index: number) => {
  currentSlide = index
}

const prev = (step = -1) => {
  const index = currentSlide > 0 ? currentSlide + step : props.slides.length - 1
  setCurrentSlide(index)
  direction = 'left'
  startSlideTimer()
}

// 우측으로 가게해줌
// 끝이아니고 더 남았으면 우측 끝이면 0
const _next = (step = 1) => {
  const index = currentSlide < props.slides.length - 1 ? currentSlide + step : 0
  setCurrentSlide(index)
  direction = 'right'
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

// 눌렀을때 해당 index로 가게 해줌.

const switchSlide = (index: number) => {
  const step = index - currentSlide
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
    <div class="w-225 h-100 relative overflow-hidden">
      <carousel-indicators
        :total="props.slides.length"
        :current-index="currentSlide"
        @switch="switchSlide($event)"
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
