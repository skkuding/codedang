<script setup lang="ts">
import { watch } from 'vue'
import { useClamp } from '@vueuse/math'
import Button from '../Atom/Button.vue'
import IconAngleLeft from '~icons/fa6-solid/angle-left'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconEllipsis from '~icons/fa6-solid/ellipsis'

const props = defineProps<{
  numberOfPages: number
  modelValue: number
  mode?: 'light' | 'dark'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const currentPage = useClamp(props.modelValue, 1, props.numberOfPages)
watch(
  () => props.modelValue,
  (modelValue) => (currentPage.value = modelValue)
)

const currentPageColor = (page: number) => {
  if (!props.mode || props.mode === 'light')
    return currentPage.value === page ? 'gray-dark' : 'gray'
  else return currentPage.value === page ? 'gray' : 'indigo'
}

watch(currentPage, (value) => {
  emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex flex-row gap-1">
    <Button
      outline
      :color="!mode || mode === 'light' ? 'gray-dark' : 'white'"
      :class="{ 'pointer-events-none': currentPage === 1 }"
      class="aspect-square rounded-lg"
      @click="currentPage--"
    >
      <IconAngleLeft />
    </Button>

    <Button
      :color="currentPageColor(1)"
      :class="{ 'pointer-events-none': currentPage === 1 }"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage = 1"
    >
      1
    </Button>

    <!-- edge case workaround -->
    <Button
      v-if="currentPage === 4 && numberOfPages === 4"
      :color="currentPageColor(2)"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage = 2"
    >
      2
    </Button>

    <div
      v-if="currentPage > 3 && numberOfPages > 4"
      class="p-2"
      :class="!mode || mode === 'light' ? 'text-gray-dark' : 'text-white'"
    >
      <IconEllipsis />
    </div>

    <Button
      v-if="currentPage > 2"
      :color="currentPageColor(currentPage - 1)"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage--"
    >
      {{ currentPage - 1 }}
    </Button>

    <Button
      v-if="![1, numberOfPages].includes(currentPage)"
      :color="currentPageColor(currentPage)"
      class="pointer-events-none aspect-square w-9 rounded-lg"
    >
      {{ currentPage }}
    </Button>

    <Button
      v-if="currentPage + 1 < numberOfPages"
      :color="currentPageColor(currentPage + 1)"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage++"
    >
      {{ currentPage + 1 }}
    </Button>

    <div
      v-if="currentPage < numberOfPages - 2 && numberOfPages > 4"
      class="p-2"
      :class="!mode || mode === 'light' ? 'text-gray-dark' : 'text-white'"
    >
      <IconEllipsis />
    </div>

    <!-- edge case workaround -->
    <Button
      v-if="currentPage === 1 && numberOfPages === 4"
      :color="currentPageColor(3)"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage = 3"
    >
      3
    </Button>

    <Button
      v-if="numberOfPages > 1"
      :color="currentPageColor(numberOfPages)"
      :class="{ 'pointer-events-none': currentPage === numberOfPages }"
      class="aspect-square w-9 rounded-lg"
      @click="currentPage = numberOfPages"
    >
      {{ numberOfPages }}
    </Button>

    <Button
      outline
      :color="!mode || mode === 'light' ? 'gray-dark' : 'white'"
      :class="{ 'pointer-events-none': currentPage === numberOfPages }"
      class="aspect-square rounded-lg"
      @click="currentPage++"
    >
      <IconAngleRight />
    </Button>
  </div>
</template>
