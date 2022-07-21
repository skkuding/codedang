<script setup lang="ts">
import { ref } from 'vue'
import PaginationTable from './PaginationTable.vue'

const fields = [
  {
    key: 'name'
  },
  { key: 'color', label: 'Colored' }
]

// initial items
const items = [
  { name: 'Apple', color: 'red' },
  { name: 'Banana', color: 'yellow' },
  { name: 'Car', color: 'blue' },
  { name: 'Dog', color: 'brown' },
  { name: 'Elephant', color: 'gray' },
  { name: 'Fox', color: 'orange' },
  { name: 'Grape', color: 'purple' },
  { name: 'Hamster', color: 'yellow' }
]

// new items of n pages
const nitems = ref(items)
const npage = ref(Math.floor((items.length + 2) / 3))

// items in current page
const cur = ref(0)
const curitems = ref(nitems.value.slice(cur.value * 3, cur.value * 3 + 3))

const filter = (keyword: string) => {
  nitems.value = items.filter((el) => {
    if (el.name.includes(keyword) || el.color.includes(keyword)) return true
    return false
  })
  npage.value = Math.floor((nitems.value.length + 2) / 3)
  cur.value = 0
  curitems.value = nitems.value.slice(cur.value * 3, cur.value * 3 + 3)
}

const changeItems = (page: number) => {
  cur.value = page - 1
  curitems.value = nitems.value.slice(cur.value * 3, cur.value * 3 + 3)
}

// show name when click the row
const selected = ref('')

const clickRow = (idx: number) => {
  selected.value = curitems.value[idx].name
}
</script>

<template>
  <Story>
    <PaginationTable
      :fields="fields"
      :number-of-items="curitems.length"
      placeholder="keywords"
      text="No data"
      :number-of-pages="npage"
      @search="filter"
      @change-page="changeItems"
      @row-clicked="clickRow"
    >
      <template #name="data">
        {{ curitems[data.index].name }}
      </template>
      <template #color="data">
        {{ curitems[data.index].color }}
      </template>
    </PaginationTable>

    <div class="mt-10">Click item : {{ selected }}</div>
  </Story>
</template>
