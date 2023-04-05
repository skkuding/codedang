<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useIntersectionObserver } from '@vueuse/core'
import axios from 'axios'
import { ref, computed } from 'vue'

const props = defineProps<{
  id: number
}>()

const fields = [
  { key: 'title', label: 'Title', width: '80%' },
  { key: 'createTime' }
]

interface Item {
  id: number
  title: string
  createTime: string
  isFixed: boolean
}

// initial items
const items = ref<Item[]>([])

const take = ref(4)
const cursor = ref(0)
const hasNextPage = ref(true)

axios
  .get(
    cursor.value
      ? `/api/group/${props.id}/notice?cursor=${cursor.value}&take=${take.value}`
      : `/api/group/${props.id}/notice?take=${take.value}`,
    {
      headers: {}
    }
  )
  .then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      res.data[i].createTime = res.data[i].createTime.toString().slice(0, 10)
    }
    items.value = res.data
    items.value.push(...res.data)
    if (res.data.length < take.value) {
      hasNextPage.value = false
    }
  })
  .catch((err) => console.log('error is ', err))

// const shownItems = ref(items.value)

const target = ref(null)
useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting && items.value.length > 0) {
    cursor.value = items.value[items.value.length - 1].id
  }
})

const shownPages = ref(items.value.length)

// items in current page
const currentPage = ref(1)
const currentItems = computed(() => items.value)

const filter = () => {
  // TODO: 추후 api 연결
}

const changeItems = (page: number) => {
  currentPage.value = page
}

// show title when click the row
const selected = ref('')

const clickRow = (row: Item) => {
  selected.value = row.title
}
</script>

<template>
  <div>
    <PaginationTable
      :fields="fields"
      :items="currentItems"
      placeholder="keywords"
      :number-of-pages="shownPages"
      @search="filter"
      @change-page="changeItems"
      @row-clicked="clickRow"
    ></PaginationTable>
  </div>
</template>
