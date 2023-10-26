<script setup lang="ts">
// import ListItem from '@/common/components/Atom/ListItem.vue'
// import PageTitle from '@/common/components/Atom/PageTitle.vue'
// import Dropdown from '@/common/components/Molecule/Dropdown.vue'
// import SearchBar from '@/common/components/Molecule/SearchBar.vue'
// import Switch from '@/common/components/Molecule/Switch.vue'
// import IconDown from '~icons/fa6-solid/angle-down'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { watch, ref, toRefs } from 'vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProblemStore, type Problem } from '../store/problem'

const emit = defineEmits<{
  (e: 'item', value: Submission & { user: string }): void
}>()

type Submission = {
  id: string
  createTime: string
  language: string
  result: string
  // user: string or user: { username: string }
}
type User = {
  user: {
    username: string
  }
}

const store = useProblemStore()
const { problem } = toRefs(store)

const route = useRoute()

const submissionItem = ref<(Submission & { user: string })[]>([])
const problemId = problem.value.id ? problem.value.id : route.params.id

const fields = [
  {
    key: 'id',
    label: '#',
    width: '15%'
  },
  {
    key: 'createTime',
    label: 'Submission time'
  },
  {
    key: 'language',
    label: 'Language',
    width: '15%'
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

const { items, totalPages, changePage } = useListAPI<Submission & User>(
  'problem/' + problemId + '/submission',
  10
)

const clickRow = (row: Submission & { user: string }) => {
  emit('item', row)
}

watch(items, () => {
  submissionItem.value = items.value.map((item: Submission & User) => {
    return {
      ...item,
      createTime: (item.createTime = useDateFormat(
        item.createTime,
        'YYYY-MM-DD hh:mm:ss'
      ).value),
      user: item.user.username
    }
  })
})
onMounted(async () => {
  if (!problem.value.id) {
    const { data } = await axios.get<Problem>(`/api/problem/${problemId}`)
    if (!store.language || problem.value.title != data.title) {
      store.language = data.languages[0]
    }
    problem.value = data
    store.type = 'problem'
  }
})
</script>

<template>
  <div class="border-r border-slate-400 bg-slate-700 p-5">
    <div class="mb-5 text-2xl font-bold text-white">
      Submissions of {{ problem.title }}
    </div>
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
      <template #result="{ row }">
        <p :class="row.result === 'Accepted' ? 'text-green' : 'text-red'">
          {{ row.result }}
        </p>
      </template>
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
