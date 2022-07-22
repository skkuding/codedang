<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
  content: string[]
}>()

const click = ref(false)

function isClicked() {
  click.value = !click.value
}
</script>

<template>
  <div class="relative inline-block">
    <div class="hover:cursor-pointer" @click="isClicked">
      <slot name="dropdown-icon"></slot>
    </div>
    <div v-show="click">
      <div
        class="absolute right-0 mt-4 w-48 rounded-lg bg-white py-1 px-2 shadow-lg"
      >
        <div v-for="c in content" :key="c">
          <div
            class="text-text-title hover:text-green my-1 flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
          >
            {{ c }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
