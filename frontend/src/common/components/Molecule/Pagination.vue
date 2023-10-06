<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { useClamp } from '@vueuse/math'
import { computed, toRefs, watch } from 'vue'
import IconAngleLeft from '~icons/fa6-solid/angle-left'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import Button from '../Atom/Button.vue'

const props = withDefaults(
  defineProps<{
    numberOfPages: number
    pageSlot?: number
    modelValue: number
    mode?: 'light' | 'dark'
  }>(),
  { pageSlot: 5, mode: 'light' }
)

const { numberOfPages, pageSlot, modelValue, mode } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
  (e: 'changePage', page: number): void
}>()

const currentPage = useClamp(modelValue.value, 1, numberOfPages)
watch(currentPage, (value) => {
  emit('changePage', value)
})

const dark = useDark()
watch(
  mode,
  (mode) => {
    dark.value = mode === 'dark'
  },
  { immediate: true }
)

const currentPageColor = (page: number) => {
  if (dark.value) return currentPage.value === page ? 'gray' : 'indigo'
  return currentPage.value === page ? 'gray-dark' : 'gray'
}

const start = computed(
  () => currentPage.value - ((currentPage.value - 1) % pageSlot.value)
)

const end = computed(() =>
  Math.min(numberOfPages.value, start.value + pageSlot.value - 1)
)

const shownPages = computed(() => {
  const pages = []
  for (let i = start.value; i <= end.value; i++) {
    pages.push(i)
  }
  return pages
})

watch(currentPage, () => {
  emit('update:modelValue', currentPage.value)
})
</script>

<template>
  <div class="flex flex-row gap-1">
    <Button
      outline
      :color="dark ? 'white' : 'gray-dark'"
      :disabled="start === 1"
      :class="{ 'pointer-events-none': currentPage === 1 }"
      class="aspect-square rounded-lg"
      @click="currentPage = start - 1"
    >
      <IconAngleLeft />
    </Button>

    <Button
      v-for="page in shownPages"
      :key="page"
      :color="currentPageColor(page)"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage = page"
    >
      {{ page }}
    </Button>

    <Button
      outline
      :color="dark ? 'white' : 'gray-dark'"
      :disabled="end === numberOfPages"
      :class="{ 'pointer-events-none': currentPage === numberOfPages }"
      class="aspect-square rounded-lg"
      @click="currentPage = end + 1"
    >
      <IconAngleRight />
    </Button>
  </div>
</template>
