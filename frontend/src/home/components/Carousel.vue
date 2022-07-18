<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import { ref } from 'vue'
const props = defineProps<{
  slides: string[]
}>()

let currentSlide = ref(0)
const switchSlide = (index: number) => {
  currentSlide.value = index
}
</script>

<template>
  <div class="relative">
    <img :src="slides[currentSlide]" class="absolute z-0" />
    <div class="z-1 absolute top-1/2 left-1/2">
      <Button
        v-for="(i, index) in slides.length"
        :key="index"
        class="aspect-square !rounded-full"
        @click="switchSlide(index)"
      ></Button>
    </div>
  </div>
</template>
