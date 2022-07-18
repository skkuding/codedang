<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '../Atom/Button.vue'
import AngelsLeft from '~icons/fa6-solid/angles-left'
import AngelsRight from '~icons/fa6-solid/angles-right'
import AngelLeft from '~icons/fa6-solid/angle-left'
import AngelRight from '~icons/fa6-solid/angle-right'

const props = defineProps<{
  numberOfPages: number
}>()

const emit = defineEmits(['change-page'])

const currentPage = ref(1)

const startPage = computed(() => {
  return Math.trunc((currentPage.value - 1) / 3) * 3 + 1
})

const endPage = computed(() => {
  return startPage.value + 2 <= props.numberOfPages
    ? startPage.value + 2
    : props.numberOfPages
})

const pageList = computed(() => {
  return [...Array(endPage.value - startPage.value + 1).keys()].map(
    (i: number) => startPage.value + i
  )
})

function changePage(page: number): void {
  if (page >= 1 && page <= props.numberOfPages) {
    currentPage.value = page
    emit('change-page', currentPage.value)
  }
}
</script>

<template>
  <div class="flex flex-row">
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(1)"
    >
      <AngelsLeft />
    </Button>
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(currentPage - 1)"
    >
      <AngelLeft />
    </Button>
    <Button
      v-for="page in pageList"
      :key="page"
      :color="page === currentPage ? 'gray-dark' : 'gray'"
      class="mr-1 aspect-square w-9 rounded-lg"
      :class="page === currentPage ? 'pointer-events-none' : ''"
      @click="changePage(page)"
    >
      {{ page }}
    </Button>
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(currentPage + 1)"
    >
      <AngelRight />
    </Button>
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(props.numberOfPages)"
    >
      <AngelsRight />
    </Button>
  </div>
</template>
