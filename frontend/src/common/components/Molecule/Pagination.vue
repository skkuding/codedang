<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '../Atom/Button.vue'
import AngelLeft from '~icons/fa6-solid/angle-left'
import AngelRight from '~icons/fa6-solid/angle-right'
import Ellipsis from '~icons/fa6-solid/ellipsis'

const props = defineProps<{
  numberOfPages: number
}>()

const emit = defineEmits(['change-page'])

defineExpose({
  changePage
})

const currentPage = ref(1)

const buttonColor = (page: number) => {
  return currentPage.value === page ? 'gray-dark' : 'gray'
}
const buttonStyle = (page: number) => {
  return currentPage.value === page
    ? 'mr-1 aspect-square w-9 rounded-lg pointer-events-none'
    : 'mr-1 aspect-square w-9 rounded-lg'
}

const pageList = computed(() => {
  let startPage = 2
  if (currentPage.value - 3 < 1) startPage = 2
  else if (currentPage.value + 3 > props.numberOfPages)
    startPage = props.numberOfPages - 3
  else startPage = currentPage.value - 1
  return [...Array(3).keys()]
    .map((i: number) => i + startPage)
    .filter((i: number) => 1 < i && i < props.numberOfPages)
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
    <!-- prev button  -->
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(currentPage - 1)"
    >
      <AngelLeft />
    </Button>

    <!-- first page = 1 -->
    <Button
      :color="buttonColor(1)"
      :class="buttonStyle(1)"
      @click="changePage(1)"
    >
      1
    </Button>

    <div
      v-if="!pageList.includes(2) && numberOfPages > 2"
      class="text-gray-dark mr-1 px-2 py-2"
    >
      <Ellipsis />
    </div>

    <!-- pageList = [cur-1, cur, cur+1] -->
    <Button
      v-for="page in pageList"
      :key="page"
      :color="buttonColor(page)"
      :class="buttonStyle(page)"
      @click="changePage(page)"
    >
      {{ page }}
    </Button>

    <div
      v-if="!pageList.includes(numberOfPages - 1) && numberOfPages > 2"
      class="text-gray-dark mr-1 px-2 py-2"
    >
      <Ellipsis />
    </div>

    <!-- last page = numberOfPages -->
    <Button
      v-if="numberOfPages > 1"
      :color="buttonColor(numberOfPages)"
      :class="buttonStyle(numberOfPages)"
      @click="changePage(numberOfPages)"
    >
      {{ numberOfPages }}
    </Button>

    <!-- next button  -->
    <Button
      class="mr-1 aspect-square rounded-lg"
      color="white"
      @click="changePage(currentPage + 1)"
    >
      <AngelRight />
    </Button>
  </div>
</template>
