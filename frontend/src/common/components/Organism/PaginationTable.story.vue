<script setup lang="ts">
import { ref, watch } from 'vue'
import PaginationTable from './PaginationTable.vue'

const fields = [
  {
    key: 'index',
    label: '#',
    width: '60px'
  },
  {
    key: 'color',
    width: '20%'
  },
  {
    key: 'name',
    label: 'Object'
  },
  { key: 'description', width: '40%' }
]

const withSubfields = [
  {
    key: 'index',
    label: '#',
    width: '60px'
  },
  {
    key: 'name',
    label: 'Object'
  },
  { key: 'description', width: '40%' },
  { key: 'more', subfields: [{ key: 'color' }, { key: 'count' }] }
]

interface Item {
  index: number
  name: string
  description: string
  color: string
  count: number
}

// initial items
const items = [
  [
    {
      index: 0,
      name: 'Apple',
      description: 'It is my favorite fruit',
      color: 'red',
      count: 100
    },
    {
      index: 1,
      name: 'Banana',
      description: 'It is my favorite fruit',
      color: 'yellow',
      count: 123
    },
    {
      index: 2,
      name: 'Car',
      description: 'It is my favorite item',
      color: 'blue',
      count: 687
    }
  ],
  [
    {
      index: 3,
      name: 'Dog',
      description: 'It is my favorite animal',
      color: 'brown',
      count: 290
    },
    {
      index: 4,
      name: 'Elephant',
      description: 'It is my favorite animal',
      color: 'gray',
      count: 102
    },
    {
      index: 5,
      name: 'Fox',
      description: 'It is my favorite animal',
      color: 'orange',
      count: 203
    }
  ],
  [
    {
      index: 6,
      name: 'Grape',
      description: 'It is my favorite fruit',
      color: 'purple',
      count: 304
    }
  ]
]

const shownItems = ref(items.map((item) => item.slice()))
const shownPages = ref(items.length)

const currentPage = ref(1)
const currentItems = ref(items[0])

watch(currentPage, (page) => {
  currentItems.value =
    shownItems.value.length > 0 ? shownItems.value[page - 1] : []
})

const filter = (keyword: string) => {
  const total = []
  for (const item of items) {
    total.push(...item.filter((value) => value.name.includes(keyword)))
  }
  shownItems.value.splice(0, shownPages.value)
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
  <Story>
    <Variant title="Default">
      <div class="p-10">
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
        <div class="text-gray-dark mt-10 text-sm">
          Click item : {{ selected }}
        </div>
      </div>
    </Variant>
    <Variant title="Editing">
      <div class="p-10">
        <PaginationTable
          :fields="fields"
          :items="currentItems"
          placeholder="keywords"
          :number-of-pages="shownPages"
          editing
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
        <div class="text-gray-dark mt-10 text-sm">
          Click item : {{ selected }}
        </div>
      </div>
    </Variant>
    <Variant title="Subheading">
      <div class="p-10">
        <PaginationTable
          :fields="withSubfields"
          :items="items[0]"
          placeholder="keywords"
          :number-of-pages="5"
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
    </Variant>
    <Variant title="Secondary">
      <div class="bg-[#1A3E51] p-10">
        <PaginationTable
          :fields="fields"
          :items="items[0]"
          mode="dark"
          placeholder="keywords"
          :number-of-pages="5"
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
    </Variant>
    <Variant title="Dark">
      <div class="bg-black p-10">
        <PaginationTable
          :fields="fields"
          :items="items[1]"
          mode="dark"
          placeholder="keywords"
          :number-of-pages="5"
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
    </Variant>
  </Story>
</template>
