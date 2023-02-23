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
  .get(`/api/group/${props.id}/notice?offset=1`, {
    headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEzLCJ1c2VybmFtZSI6InVzZXIxMCIsImlhdCI6MTY3NzEzOTM2OCwiZXhwIjoxNjc3MTQxMTY4LCJpc3MiOiJza2t1ZGluZy5kZXYifQ.65trJwV5MkvhD30dc30Y2HiTJazX9_t4G0dZnKeWuOU'
      // 임시 토큰
    }
  })
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

// 추후 api 연결
const filter = () => {
  // const total = []
  // for (const item of items) {
  //   total.push(
  //     ...item.filter(
  //       (value) =>
  //         value.title.includes(keyword) || value.createTime.includes(keyword)
  //     )
  //   )
  // }
  // shownItems.value.splice(0, shownItems.value.length)
  // while (total.length > 0) {
  //   shownItems.value.push(total.splice(0, 3))
  // }
  // shownPages.value = shownItems.value.length
  // currentPage.value = 1
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
