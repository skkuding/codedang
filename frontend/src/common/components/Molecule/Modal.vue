<script setup lang="ts">
import IconClose from '~icons/fa-solid/times'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()
</script>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  /* inherit class attribute only to modal itself
   * `inheritAttrs` option does not support `<script setup>`
   * https://vuejs.org/guide/extras/composition-api-faq.html#does-composition-api-cover-all-use-cases
   */
  inheritAttrs: false
})
</script>

<template>
  <transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    mode="out-in"
  >
    <div
      v-show="modelValue"
      class="fixed inset-0 flex h-full w-full items-center justify-center bg-black/25 backdrop-blur"
      @click="$emit('update:modelValue', false)"
    >
      <section
        class="relative h-fit w-fit overflow-hidden rounded-lg bg-white"
        :class="$attrs.class"
      >
        <IconClose
          class="text-gray absolute right-4 top-4 cursor-pointer text-xl hover:opacity-70 active:opacity-50"
          @click="$emit('update:modelValue', false)"
        />
        <slot />
      </section>
    </div>
  </transition>
</template>
