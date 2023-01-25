<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, computed } from 'vue'

defineProps<{
  id: number
}>()

const fields = [{ key: 'name', label: 'Title' }, { key: 'Date' }]

interface Item {
  name: string
  date: string
}

// initial items
const items: Item[][] = [
  [
    { name: 'Apple', date: 'red' },
    { name: 'Banana', date: 'yellow' },
    { name: 'Car', date: 'blue' }
  ],
  [
    { name: 'Dog', date: 'brown' },
    { name: 'Elephant', date: 'gray' },
    { name: 'Fox', date: 'orange' }
  ],
  [
    { name: 'Grape', date: 'purple' },
    { name: 'Hamster', date: 'yellow' }
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
