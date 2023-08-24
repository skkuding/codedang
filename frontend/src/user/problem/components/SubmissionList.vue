<script setup lang="ts">
import ListItem from '@/common/components/Atom/ListItem.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
import { ref } from 'vue'
import IconDown from '~icons/fa6-solid/angle-down'

const emit = defineEmits<{
  (e: 'id', value: string): void
}>()

type Submission = {
  id: string
  createTime: string
  language: string
  result: string
  user: {
    username: string
  }
}

const showOnlyMine = ref(true)
const fields = [
  {
    key: 'id',
    label: '#'
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

const { items, totalPages, changePage } = useListAPI<Submission>(
  'problem/1/submission',
  10
)
console.log(items) // not working
const submissionItem = items.value.map((item: Submission) => {
  console.log(item)
  return { ...item, user: item.user.username }
})
console.log(submissionItem)

const clickRow = (row: Record<string, string>) => {
  emit('id', row.id)
}
</script>

<template>
  <div class="bg-slate-700 p-5">
    <PageTitle color="white" text="Submissions of A. 가파른 경사" />
    <PaginationTable
      :fields="fields"
      :items="submissionItem"
      placeholder="keywords"
      :number-of-pages="totalPages"
      no-search-bar
      mode="dark"
      @change-page="changePage"
      @row-clicked="clickRow"
    >
      <template #option>
        <div class="flex flex-wrap items-baseline space-x-3 space-y-3">
          <Switch v-model="showOnlyMine" label="Only Mine" class="ml-3" />
          <SearchBar placeholder="User" short />
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
