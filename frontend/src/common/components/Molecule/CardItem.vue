<script setup lang="ts">
defineProps<{
  ccolor: string
  img: string
  leftTop: string
  rightTop: string
  leftBottom: string
  rightBottomFull: string
  rightBottomShort: string
}>()

interface borderColorType {
  [key: string]: string
}

const borderColor: borderColorType = {
  green: 'border-green',
  gray: 'border-gray'
}
</script>

<template>
  <div
    class="mx-40 flex cursor-pointer border p-3 hover:shadow"
    :class="borderColor[ccolor]"
  >
    <img :src="img" class="aspect-square w-16" />
    <div class="flex w-full pl-2">
      <div class="relative w-full pl-2">
        <div class="text-xl font-bold">{{ leftTop }}</div>
        <div class="text-gray-dark">
          {{ leftBottom }}
        </div>
      </div>
      <div class="relative w-1/2">
        <div class="hidden text-right md:block">
          {{ rightTop }}
        </div>
        <!-- when screen size is 1440px -->
        <div
          class="text-green absolute bottom-0 right-0 hidden text-right md:block"
        >
          {{ rightBottomFull }}
        </div>
        <!-- when screen size is smaller than 768px -->
        <div
          class="text-green absolute bottom-0 right-0 block text-right md:hidden"
        >
          {{ rightBottomShort }}
        </div>
      </div>
    </div>
  </div>
</template>
