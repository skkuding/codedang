<script setup lang="ts">
import MaterialSymbolsMenu from '~icons/material-symbols/menu'
import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded'
import { computed } from 'vue'

interface data {
  title: string
  date: string
  state?: string
}

const props = defineProps<{
  carditemlist: data[]
}>()
</script>

<template>
  <div class="mb-3 w-full max-w-[610px] rounded-lg p-5 shadow-xl">
    <div class="flex w-full flex-col">
      <div class="mb-3 flex w-full flex-row justify-between align-middle">
        <div class="flex"><slot name="title"></slot></div>
        <a href="#"><MaterialSymbolsMenu /></a>
      </div>
      <ul>
        <li
          v-for="item in carditemlist"
          :key="item.title"
          class="mt-2 flex flex-row align-middle"
        >
          <div class="mx-1">
            <slot name="icon" :item="item.state"></slot>
          </div>
          <div class="w-2/3">
            <a href="#">{{ item.title }}</a>
          </div>
          <div class="w-1/3 text-right">
            <a href="#">{{ item.date }}</a>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
