<script setup lang="ts">
import { ref } from 'vue'
import { OnClickOutside } from '@vueuse/components'

const show = ref(false)
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
  <div class="relative">
    <button class="cursor-pointer" @click="show = true">
      <slot name="button" />
    </button>
    <OnClickOutside @trigger="show = false">
      <ul
        v-show="show"
        class="border-gray-light absolute right-0 z-30 flex w-max flex-col gap-1 rounded-lg border p-2 shadow-lg"
        :class="$attrs.class || 'bg-white'"
      >
        <slot name="items" />
      </ul>
    </OnClickOutside>
  </div>
</template>
