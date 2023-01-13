<script setup lang="ts">
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'

const show = ref(false)

defineProps<{
  color?: 'white' | 'slate'
}>()

const colorMapper = {
  white: 'bg-white border-gray-light border',
  slate: 'bg-slate-500 border-slate-600 border'
}
</script>

<template>
  <div class="relative inline-block">
    <button class="cursor-pointer" @click="show = true">
      <slot name="button" />
    </button>
    <OnClickOutside @trigger="show = false">
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
        mode="out-in"
      >
        <ul
          v-show="show"
          :class="colorMapper[color || 'white']"
          class="absolute right-0 z-30 flex w-max flex-col gap-1 rounded-lg p-2 shadow-lg"
        >
          <slot name="items" />
        </ul>
      </Transition>
    </OnClickOutside>
  </div>
</template>
