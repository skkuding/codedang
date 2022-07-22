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
  noticelist: data[]
}>()
</script>

<template>
  <div class="mb-3 max-w-[610px] rounded-lg p-5 shadow-xl">
    <div class="relative w-full">
      <div class="flex flex-row align-middle">
        <table class="mb-3 w-full">
          <tr>
            <th class="mb-3 flex flex-row align-middle">
              <slot></slot>
              <div class="absolute right-0">
                <a href="#"><MaterialSymbolsMenu /></a>
              </div>
            </th>
          </tr>
          <ul>
            <tr
              v-for="item in noticelist"
              :key="item.title"
              class="mt-2 flex flex-row align-middle"
            >
              <td class="mx-1">
                <slot name="notice-icon"></slot>
                <slot
                  v-if="item.state === 'ongoing'"
                  name="contest-icon-ongoing"
                ></slot>
                <slot
                  v-if="item.state === 'prearranged'"
                  name="contest-icon-prearranged"
                ></slot>
              </td>
              <td class="w-2/3">
                <a href="#">{{ item.title }}</a>
              </td>
              <td class="w-1/3 text-right">
                <a href="#">{{ item.date }}</a>
              </td>
            </tr>
          </ul>
        </table>
      </div>
    </div>
  </div>
</template>
