<script setup lang="ts">
import { useIntervalFn } from '@vueuse/core'
import { ref } from 'vue'
import Fa6SolidAngleLeft from '~icons/fa6-solid/angle-left'
import Fa6SolidAngleRight from '~icons/fa6-solid/angle-right'

interface Slide {
  topTitle: string
  bottomTitle: string
  sub: string
  img: string
  imgAlt: string
  color: 'green' | 'black' | 'white' | 'yellow'
  href: string
}
const props = defineProps<{ slides: Slide[] }>()

const bgColors: { [key: string]: string } = {
  green: 'bg-[#2e4e3f]',
  black: 'bg-[#333333]',
  white: 'bg-[#ffffff]',
  yellow: 'bg-[#f9de4a]'
}
const textColors: { [key: string]: string } = {
  green: 'text-white',
  black: 'text-white',
  white: 'text-black',
  yellow: 'text-black'
}

const currentSlideIndex = ref(0)
const { pause, resume } = useIntervalFn(() => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % props.slides.length
}, 5000)

const clickLeft = () => {
  currentSlideIndex.value =
    (currentSlideIndex.value - 1 + props.slides.length) % props.slides.length
  pause()
  resume()
}

const clickRight = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % props.slides.length
  pause()
  resume()
}
</script>

<template>
  <div
    class="relative mt-3 h-[400px] overflow-hidden rounded-3xl"
    :class="bgColors[slides[currentSlideIndex].color]"
  >
    <div class="absolute bottom-0 left-0 right-0 z-50 mb-3 flex justify-center">
      <div
        class="flex items-center justify-center gap-2 rounded-full bg-black bg-opacity-70 px-3 py-1.5 text-sm font-bold text-white"
      >
        <button class="opacity-70 hover:opacity-100" @click="clickLeft">
          <Fa6SolidAngleLeft class="text-xs" />
        </button>
        <p class="flex gap-1">
          <span>{{ currentSlideIndex + 1 }}</span>
          <span class="font-thin text-slate-300">/</span>
          <span>{{ slides.length }}</span>
        </p>
        <button class="opacity-70 hover:opacity-100" @click="clickRight">
          <Fa6SolidAngleRight class="text-xs" />
        </button>
      </div>
    </div>
    <RouterLink :to="slides[currentSlideIndex].href">
      <div
        v-for="(item, index) in slides"
        :key="index"
        class="absolute left-0 top-0 flex h-full w-full justify-center opacity-0 transition-opacity duration-1000 ease-in-out"
        :class="`${index === currentSlideIndex && 'opacity-100'} ${
          bgColors[item.color]
        }`"
      >
        <div
          class="flex w-full max-w-7xl flex-col-reverse items-center justify-between gap-5 p-8 py-14 md:flex-row md:px-16 md:py-0"
        >
          <div class="flex flex-col items-start justify-center md:gap-5">
            <div :class="textColors[item.color]">
              <p
                class="mb-2 whitespace-nowrap text-2xl font-semibold md:text-3xl"
              >
                {{ item.topTitle }}
              </p>
              <p
                class="mb-2 whitespace-nowrap text-2xl font-semibold md:text-3xl"
              >
                {{ item.bottomTitle }}
              </p>
            </div>
            <p class="md:text-lg" :class="textColors[item.color]">
              {{ item.sub }}
            </p>
          </div>
          <img
            :src="item.img"
            :alt="item.imgAlt"
            class="h-[200px] object-contain md:h-[350px]"
          />
        </div>
      </div>
    </RouterLink>
  </div>
</template>
