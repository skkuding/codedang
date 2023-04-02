<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
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

axios
  .get(
    `/api/group/${props.id}/notice?cursor=${
      ref(items).value.length || 1
    }&take=10`,
    {
      // TODO: cursor를 variable로
      headers: {}
    }
  )
  .then((res) => {
    for (let i = 0; i < res.data.length; i++) {
      res.data[i].createTime = res.data[i].createTime.toString().slice(0, 10)
    }
    items.value = res.data
  })
  .catch((err) => console.log('error is ', err))

// const shownItems = ref(items.value)
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
