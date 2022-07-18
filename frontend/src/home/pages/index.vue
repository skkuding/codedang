<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
const fields = [
  {
    key: 'name'
  },
  { key: 'color', label: 'Colored' }
]

const items = [
  { name: 'Apple', color: 'red' },
  { name: 'Banana', color: 'yellow' },
  { name: 'Car', color: 'blue' },
  { name: 'Dog', color: 'brown' },
  { name: 'Fox', color: 'orange' }
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
  <div>This is Main page</div>
  <MyComponent msg="Main!" />
  <div class="mx-40">
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
  </div>
</template>
