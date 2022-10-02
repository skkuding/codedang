<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, watch } from 'vue'
interface Item {
  id: number
  user: string
  userId: number
  code: string
  language: string
  result: string
}
const items = [
  [
    {
      id: 19715,
      user: 'root',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19713,
      user: 'lulu',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19712,
      user: 'jimin',
      userId: 123,
      code: 'print("abc")',
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19715,
      user: 'root',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19713,
      user: 'lulu',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    }
  ],
  [
    {
      id: 19712,
      user: 'jimin',
      userId: 123,
      code: 'print("abc")',
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19715,
      user: 'root',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19713,
      user: 'lulu',
      userId: 123,
      code: "print('abc')",
      language: 'C++',
      result: 'Wrong Answer'
    },
    {
      id: 19712,
      user: 'jimin',
      userId: 123,
      code: 'print("abc")',
      language: 'C++',
      result: 'Wrong Answer'
    }
  ]
]
const fields = [
  {
    key: 'id',
    label: 'Submission No.'
  },
  {
    key: 'createTime',
    label: 'Submission time'
  },
  {
    key: 'language',
    label: 'Language'
  },
  {
    key: 'user',
    label: 'User'
  },
  {
    key: 'codeSize',
    label: 'Code Size'
  },
  {
    key: 'result',
    label: 'Result'
  }
]
const shownItems = ref(items.map((item) => item.slice()))
const shownPages = ref(items.length)

const currentPage = ref(1)
const currentItems = ref(items[0])

watch(currentPage, (page) => {
  currentItems.value =
    shownItems.value.length > 0 ? shownItems.value[page - 1] : []
})

const changeItems = (page: number) => {
  currentPage.value = page
}

const selected = ref()

const clickRow = (row: Item) => {
  selected.value = row.id
}
</script>

<template>
  <PaginationTable
    :fields="fields"
    :items="currentItems"
    placeholder="keywords"
    :number-of-pages="shownPages"
    :no-search-bar="true"
    @change-page="changeItems"
    @row-clicked="clickRow"
  ></PaginationTable>
</template>
