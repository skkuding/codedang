<script setup lang="ts">
import { computed, ref } from 'vue'
import Button from '../Atom/Button.vue'

const props = defineProps<{
  numberOfPages: number
}>()

const emit = defineEmits(['change-page'])

let currentPage = ref(1)

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
      class="mr-1 aspect-square w-8 rounded-lg"
      color="white"
      @click="changePage(1)"
    >
      «
    </Button>
    <Button
      class="mr-1 aspect-square w-8 rounded-lg"
      color="white"
      @click="changePage(currentPage - 1)"
    >
      &lt;
    </Button>
    <Button
      v-for="page in pageList"
      :key="page"
      :color="page === currentPage ? 'gray-dark' : 'gray'"
      class="mr-1 aspect-square w-8 rounded-lg"
      :class="page === currentPage ? 'pointer-events-none' : ''"
      @click="changePage(page)"
    >
      {{ page }}
    </Button>
    <Button
      class="mr-1 aspect-square w-8 rounded-lg"
      color="white"
      @click="changePage(currentPage + 1)"
    >
      &gt;
    </Button>
    <Button
      class="mr-1 aspect-square w-8 rounded-lg"
      color="white"
      @click="changePage(props.numberOfPages)"
    >
      »
    </Button>
  </div>
</template>
