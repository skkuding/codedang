<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, computed } from 'vue'

defineProps<{
  id: number
}>()

const fields = [{ key: 'name', label: 'Title', width: '80%' }, { key: 'date' }]

interface Item {
  name: string
  date: string
}

// initial items
const items: Item[][] = [
  [
    { name: 'Coding Platform 모의대회입니당', date: '2023-12-31' },
    { name: 'Coding Platform 모의대회', date: '2023-12-31' },
    { name: 'Coding Platform 모의대회', date: '2023-12-31' }
  ],
  [
    { name: 'Coding Platform 모의대회', date: '2023-12-31' },
    { name: 'Coding Platform 모의대회', date: '2023-12-31' },
    { name: 'Coding Platform 모의대회', date: '2023-12-31' }
  ],
  [
    { name: 'Coding Platform 모의대회', date: '2023-12-31' },
    { name: 'Coding Platform 모의대회', date: '2023-12-31' }
  ]
]

const shownItems = ref(items)
const shownPages = ref(items.length)

// items in current page
const currentPage = ref(1)
const currentItems = computed(() => shownItems.value[currentPage.value - 1])

const filter = (keyword: string) => {
  const total = []
  for (const item of items) {
    total.push(
      ...item.filter(
        (value) => value.name.includes(keyword) || value.date.includes(keyword)
      )
    )
  }
  shownItems.value.splice(0, shownItems.value.length)
  while (total.length > 0) {
    shownItems.value.push(total.splice(0, 3))
  }
  shownPages.value = shownItems.value.length
  currentPage.value = 1
}

const changeItems = (page: number) => {
  currentPage.value = page
}

// show name when click the row
const selected = ref('')

const clickRow = (row: Item) => {
  selected.value = row.name
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
