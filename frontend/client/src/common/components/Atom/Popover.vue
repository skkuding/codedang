<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  text: string
  contentId: string
  hover?: boolean
}>()

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const open = ref(false)
const toggle = () => {
  if (!props.hover) open.value = !open.value
}
const setHover = () => {
  if (props.hover) open.value = true
}
const setHoverFalse = () => {
  if (props.hover) open.value = false
}
</script>

<template>
  <div class="relative">
    <span @click="toggle" @mouseover="setHover" @mouseleave="setHoverFalse">
      <slot name="content" />
    </span>
    <teleport v-if="mounted && open" :to="contentId">
      <span
        class="border-t-gray absolute bottom-full left-0 ml-2 border-x-8 border-b-0 border-t-8 border-solid border-x-transparent"
      />
      <span
        class="bg-gray text-text absolute bottom-full left-0 my-2 whitespace-nowrap rounded px-2 py-1"
      >
        {{ text }}
      </span>
    </teleport>
  </div>
</template>
