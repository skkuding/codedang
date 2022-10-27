<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, computed } from 'vue'

defineProps<{
  id: number
}>()

const fields = [{ key: 'name', label: 'Object' }, { key: 'color' }]

interface Item {
  name: string
  color: string
}

// initial items
const items: Item[][] = [
  [
    { name: 'Apple', color: 'red' },
    { name: 'Banana', color: 'yellow' },
    { name: 'Car', color: 'blue' }
  ],
  [
    { name: 'Dog', color: 'brown' },
    { name: 'Elephant', color: 'gray' },
    { name: 'Fox', color: 'orange' }
  ],
  [
    { name: 'Grape', color: 'purple' },
    { name: 'Hamster', color: 'yellow' }
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
        (value) => value.name.includes(keyword) || value.color.includes(keyword)
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
    >
      <template #color="{ row }">
        <div class="flex items-center gap-2">
          <span
            class="h-5 w-5 rounded-full"
            :style="'background:' + row.color"
          />
          {{ row.color }}
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
