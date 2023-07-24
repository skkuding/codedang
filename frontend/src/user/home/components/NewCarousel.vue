<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'
import Fa6SolidAngleLeft from '~icons/fa6-solid/angle-left'

const props = defineProps<{ slides: Record<string, string>[] }>()

const bgColors: { [key: string]: string } = {
  green: 'bg-[#2e4e3f]',
  black: 'bg-[#333333]',
  white: 'bg-[#ffffff]'
}
const textColors: { [key: string]: string } = {
  green: 'text-white',
  black: 'text-white',
  white: 'text-black'
}

const currentSlideIndex = ref(0)
const interval: Ref<number> = ref(0)

const newInterval = () => {
  interval.value = window.setInterval(() => {
    currentSlideIndex.value =
      (currentSlideIndex.value + 1) % props.slides.length
  }, 5000)
}

const clickLeft = () => {
  currentSlideIndex.value =
    (currentSlideIndex.value - 1 + props.slides.length) % props.slides.length
  window.clearInterval(interval.value)
  newInterval()
}

const clickRight = () => {
  currentSlideIndex.value = (currentSlideIndex.value + 1) % props.slides.length
  window.clearInterval(interval.value)
  newInterval()
}

onMounted(() => {
  newInterval()
})
</script>

<template>
  <div
    class="relative h-[450px] md:h-[400px]"
    :class="bgColors[slides[(currentSlideIndex + 1) % slides.length].color]"
  >
    <div
      v-for="(item, index) in slides"
      :key="index"
      class="absolute left-0 top-0 flex h-full w-full justify-center opacity-0 transition-opacity duration-1000 ease-in-out"
      :class="
        (index === currentSlideIndex ? 'opacity-100' : '') +
        ' ' +
        bgColors[item.color]
      "
    >
      <div
        class="flex w-full max-w-7xl flex-col-reverse justify-between gap-5 p-8 md:flex-row lg:px-16"
      >
        <div class="flex flex-col items-start justify-center gap-5">
          <div :class="textColors[item.color]">
            <p class="mb-2 whitespace-nowrap text-3xl font-semibold">
              {{ item.topTitle }}
            </p>
            <p class="whitespace-nowrap text-3xl font-semibold">
              {{ item.bottomTitle }}
            </p>
          </div>
          <p class="text-lg" :class="textColors[item.color]">{{ item.sub }}</p>
          <div
            class="mix-blend- flex items-center justify-center gap-2 rounded-full bg-black bg-opacity-70 px-3 py-1.5 text-sm font-bold text-white"
          >
            <button class="opacity-70 hover:opacity-100" @click="clickLeft">
              <Fa6SolidAngleLeft class="text-xs" />
            </button>
            <p class="flex gap-1">
              <span>{{ index + 1 }}</span>
              <span class="font-thin text-slate-300">/</span>
              <span>{{ slides.length }}</span>
            </p>
            <button class="opacity-70 hover:opacity-100" @click="clickRight">
              <Fa6SolidAngleLeft class="rotate-180 text-xs" />
            </button>
          </div>
        </div>
        <img
          :src="item.img"
          :alt="item.imgAlt"
          class="h-[200px] object-contain md:h-[350px]"
        />
      </div>
    </div>
  </div>
</template>
