<script setup lang="ts">
import { OnClickOutside } from '@vueuse/components'
import { useToggle } from '@vueuse/core'

const [show, toggle] = useToggle()

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
    <OnClickOutside @trigger="show = false">
      <button class="cursor-pointer" @click="toggle()">
        <slot name="button" />
      </button>
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
          class="absolute right-0 z-30 flex w-max min-w-full flex-col gap-1 rounded-lg p-2 shadow-lg"
        >
          <slot name="items" />
        </ul>
      </Transition>
    </OnClickOutside>
  </div>
</template>
