<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import ListItem from '@/common/components/Atom/ListItem.vue'
import IconDown from '~icons/fa6-solid/angle-down'
import { ref, watch } from 'vue'

defineEmits<{
  (e: 'selectSubmission', value: number): void
}>()

const showOnlyMine = true

interface Submission {
  id: number
  user: string
  userId: number
  code: string
  language: string
  result: string
}
const submissionList: Submission[][] = [
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
const shownSubmissionList = ref(submissionList.map((s) => s.slice()))
const shownPages = ref(submissionList.length)

const currentPage = ref(1)
const currentSubmissionList = ref(submissionList[0])

watch(currentPage, (page) => {
  currentSubmissionList.value =
    shownSubmissionList.value.length > 0
      ? shownSubmissionList.value[page - 1]
      : []
})

const changeSubmissionList = (page: number) => {
  currentPage.value = page
}

const selected = ref()

const clickRow = (row: Submission) => {
  selected.value = row.id
}
</script>

<template>
  <div class="bg-slate-700 p-5">
    <PaginationTable
      :fields="fields"
      :items="currentSubmissionList"
      placeholder="keywords"
      :number-of-pages="shownPages"
      :no-search-bar="true"
      mode="dark"
      @change-page="changeSubmissionList"
      @row-clicked="clickRow"
    >
      <template #option>
        <div class="flex flex-wrap items-baseline space-x-3 space-y-3">
          <Switch
            v-model="showOnlyMine"
            label="Only Mine"
            class="ml-3"
          ></Switch>
          <SearchBar placeholder="User" short></SearchBar>
          <Dropdown color="white">
            <template #button>
              <div
                class="flex h-9 w-40 flex-row items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white"
              >
                <span>All Languages</span>
                <IconDown class="h-4 w-4" />
              </div>
            </template>
            <template #items>
              <ListItem>C++</ListItem>
              <ListItem>Python</ListItem>
            </template>
          </Dropdown>
          <Dropdown color="white">
            <template #button>
              <div
                class="mr-3 flex h-9 w-32 flex-row items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white"
              >
                <span>All Result</span>
                <IconDown class="h-4 w-4" />
              </div>
            </template>
            <template #items>
              <ListItem>Accepted</ListItem>
              <ListItem>Wrong Answer</ListItem>
            </template>
          </Dropdown>
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
