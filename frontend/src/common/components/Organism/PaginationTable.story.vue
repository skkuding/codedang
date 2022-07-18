<script setup lang="ts">
import { ref } from 'vue'
import PaginationTable from './PaginationTable.vue'
const fields = [
  {
    key: 'name'
  },
  { key: 'color', label: 'Colored' }
]

const items = [
  { name: 'Apple', color: 'red' },
  { name: 'Banana', color: 'yellow' },
  { name: 'Car', color: 'blue' }
]
const nitems = ref(items)

const filter = (keyword: string) => {
  nitems.value = items.filter((el) => {
    if (el.name.includes(keyword) || el.color.includes(keyword)) return true
    return false
  })
}
</script>

<template>
  <Story>
    <PaginationTable
      :fields="fields"
      :items="nitems"
      placeholder="keywords"
      text="No data"
      :number-of-pages="5"
      @search="filter"
    >
      <template #name="data">
        {{ data.row.name }}
      </template>
      <template #color="data">
        {{ data.row.color }}
      </template>
    </PaginationTable>
  </Story>
</template>
