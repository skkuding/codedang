<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  items: string[]
  color?: string
}>()

var activeItem = ref(props.items[0])
var hoverItem = ref()
const tabcolor = props.color ? props.color : '#8DC63F'

const activeStyle = (item: string) => {
  return item === activeItem.value
    ? `color: ${tabcolor}; border-bottom: 3px solid ${tabcolor};`
    : ''
}
const hoverStyle = (item: string) => {
  return item === hoverItem.value ? `color: ${tabcolor};` : ''
}

const setActiveItem = (item: string) => {
  activeItem.value = item
}
const setHoverItem = (item: string) => {
  hoverItem.value = item
}
const setHoverFalse = () => {
  hoverItem.value = ''
}
</script>

<template>
  <div class="mx-auto w-4/5">
    <div class="bg-gray h-px" />
    <ul class="flex justify-center">
      <li
        v-for="item in items"
        :key="item"
        class="text-text-title mx-2 cursor-pointer p-2 text-xl"
        :style="[hoverStyle(item), activeStyle(item)]"
        @click="setActiveItem(item)"
        @mouseover="setHoverItem(item)"
        @mouseleave="setHoverFalse()"
      >
        {{ item.charAt(0).toUpperCase() + item.slice(1) }}
      </li>
    </ul>
    <div class="bg-gray h-px" />

    <div class="m-4"><slot :name="`${activeItem}`"></slot></div>
  </div>
</template>
