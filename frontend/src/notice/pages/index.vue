<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Header from '@/common/components/Organism/Header.vue'
import { useRouter } from 'vue-router'
import { ref, computed } from 'vue'

interface field {
  key: string
  label?: string
  custom?: boolean
}
interface item {
  [key: string]: any
}
const router = useRouter()
const goDetail = (item: any) => {
  router.push({
    name: 'notice-id',
    params: { id: item.id }
  })
}
const noticeField: field[] = [
  {
    key: 'title',
    label: 'Title'
  },
  {
    key: 'date',
    label: 'Date'
  }
]
const noticeItem: item[] = [
  {
    title: '111111',
    date: '2022-05-06',
    id: 1
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 2
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 3
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 4
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 5
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 6
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 7
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 8
  },
  {
    title: '222222',
    date: '2022-05-07',
    id: 9
  }
]

const perPage = 5
const shownPages = ref(
  noticeItem.length % perPage === 0
    ? noticeItem.length / perPage
    : Math.floor(noticeItem.length / perPage) + 1
)
const shownItems = ref(noticeItem)
const currentPage = ref(1)

let currentItems = computed(() =>
  shownItems.value.slice(
    (currentPage.value - 1) * perPage,
    currentPage.value * perPage
  )
)

const search = (keyword: string) => {
  const total = noticeItem.filter((i) => i.title.includes(keyword))
  shownItems.value = total
  shownPages.value = shownItems.value.length / perPage
  currentPage.value = 1
}

const changeItems = (page: number) => {
  currentPage.value = page
}
</script>

<template>
  <Header></Header>
  <div class="mx-auto w-[70%]">
    <PageTitle text="Notice" />
    <PaginationTable
      :fields="noticeField"
      :items="currentItems"
      text="No Notice"
      :number-of-pages="shownPages"
      @search="search"
      @change-page="changeItems"
      @row-clicked="goDetail"
    ></PaginationTable>
  </div>
</template>
