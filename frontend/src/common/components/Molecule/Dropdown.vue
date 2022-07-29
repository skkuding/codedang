<script setup lang="ts">
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'

defineProps<{
  items: string[]
}>()

const show = ref(false)
</script>

<template>
  <div class="relative inline-block">
    <button class="cursor-pointer" @click="show = true">
      <slot name="dropdown-icon" />
    </button>
    <OnClickOutside @trigger="show = false">
      <ul
        v-show="show"
        class="border-gray-light absolute right-0 flex w-max flex-col gap-1 rounded-lg border bg-white p-2 shadow-lg"
      >
        <li
          v-for="item in items"
          :key="item"
          class="text-text-title hover:bg-gray/30 active:bg-gray/50 w-full cursor-pointer rounded-lg px-2 py-1 font-medium"
        >
          {{ item }}
        </li>
      </ul>
    </OnClickOutside>
  </div>
</template>
