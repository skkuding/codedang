<script setup lang="ts">
import { useRouteQuery } from '@vueuse/router'

const props = defineProps<{
  items: string[]
  color?: string
}>()
const tab = useRouteQuery<string | null>('tab')
const tabColor = props.color ? props.color : '#8dc63f'
// TODO: use preset color
// https://github.com/skkuding/next/pull/122#discussion_r928096433

const hoverStyle = props.color
  ? `hover:text-[${props.color}]`
  : `hover:text-[#8dc63f]`

const activeStyle = (item: string) => {
  return item === (tab.value || props.items[0])
    ? `color: ${tabColor}; border-bottom: 3px solid ${tabColor};`
    : ''
}

const setActiveItem = (item: string) => {
  tab.value = item
}
</script>

<template>
  <ul v-bind="$attrs" class="border-gray flex w-full justify-center border-y">
    <li
      v-for="item in items"
      :key="item"
      :class="hoverStyle"
      class="text-text-title mx-2 cursor-pointer p-2 text-xl"
      :style="activeStyle(item)"
      @click="setActiveItem(item)"
    >
      {{ item.charAt(0).toUpperCase() + item.slice(1) }}
    </li>
  </ul>

  <div class="m-4"><slot :name="tab || items[0]" /></div>
</template>
