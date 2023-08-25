<script setup lang="ts">
// import ListItem from '@/common/components/Atom/ListItem.vue'
// import PageTitle from '@/common/components/Atom/PageTitle.vue'
// import Dropdown from '@/common/components/Molecule/Dropdown.vue'
// import SearchBar from '@/common/components/Molecule/SearchBar.vue'
// import Switch from '@/common/components/Molecule/Switch.vue'
// import IconDown from '~icons/fa6-solid/angle-down'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
import { watch, ref } from 'vue'
import { useProblemStore } from '../store/problem'

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

// const showOnlyMine = ref(true)
const store = useProblemStore()
const submissionItem = ref<Record<string, string>[]>([])
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
    key: 'result',
    label: 'Result'
  }
]
const { items, totalPages, changePage } = useListAPI<Submission>(
  'problem/1/submission',
  10
)
const clickRow = (row: Record<string, string>) => {
  emit('id', row.id)
}

watch(items, () => {
  submissionItem.value = items.value.map((item: Submission) => {
    return { ...item, user: item.user.username }
  })
})
</script>

<template>
  <div class="border-r border-slate-400 bg-slate-700 p-5">
    <div class="mb-5 text-3xl text-white">{{ store.problem.title }}</div>
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
      <!--
        TODO: 각종 filtering api 구현되면 주석 해제
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
      -->
    </PaginationTable>
  </div>
</template>
