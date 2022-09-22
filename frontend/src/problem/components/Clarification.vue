<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import IconSound from '~icons/quill/sound'

const visible = ref(false)
</script>

<template>
  <button
    class="item bg-gray h-[200px] w-[200px] rounded-full"
    @click="visible = !visible"
  >
    <div class="relative">
      <button
        class="bg-red absolute top-0.5 right-0.5 h-[50px] w-[50px] rounded-full font-bold text-white"
      >
        1
      </button>
    </div>
    <div class="flex justify-center">
      <IconSound class="text-7xl" />
    </div>
  </button>
  <div v-if="visible" class="bg-gray fixed h-96 w-96 overflow-auto">
    <pre>
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    z
    </pre>
  </div>
</template>
