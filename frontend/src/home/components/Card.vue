<script setup lang="ts">
import MaterialSymbolsMenu from '~icons/material-symbols/menu'
import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded'
interface data {
  title: string
  date: string
}

defineProps<{
  noticelist: data[]
}>()
</script>

<template>
  <div class="text-gray mb-3 max-w-[610px] rounded-lg p-5 shadow-xl">
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
              <td>
                <a href="#"><MaterialSymbolsArrowForwardIosRounded /></a>
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
