<script setup lang="ts">
import IconClose from '~icons/fa6-solid/xmark'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

// inherit class attribute only to modal itself
defineOptions({ inheritAttrs: false })
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
      class="fixed inset-0 z-40 flex h-full w-full items-center justify-center bg-black/25 p-5 backdrop-blur"
      @click.self="$emit('update:modelValue', false)"
    >
      <section
        class="p=5 relative max-h-[96%] overflow-y-auto rounded-lg bg-white p-10"
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
