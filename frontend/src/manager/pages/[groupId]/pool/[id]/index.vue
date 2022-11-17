<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Button from '@/common/components/Atom/Button.vue'
import SharePoolModal from '@/manager/components/SharePoolModal.vue'
import IconSolidPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import IconCheck from '~icons/fa6-solid/check'
import { ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { Bar, Radar } from 'vue-chartjs'

Chart.register(...registerables)

defineProps<{
  groupId: number
  id: number
}>()

const colorMapper = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-level-1'
    case 2:
      return 'bg-level-2'
    case 3:
      return 'bg-level-3'
    case 4:
      return 'bg-level-4'
    case 5:
      return 'bg-level-5'
    case 6:
      return 'bg-level-6'
    case 7:
      return 'bg-level-7'
    default:
      return 'bg-gray'
  }
}

const problemFields = [
  { key: 'id' },
  { key: 'title' },
  { key: 'level', name: 'Difficulty' },
  { key: 'tags' },
  { key: 'updatetime', name: 'LastUpdate' },
  { key: 'delete' }
]

const problems = ref([
  {
    id: 1,
    title: '가파른 경사',
    level: 1,
    tags: 'if-statement',
    updatetime: '2021-12-31 18:20:29',
    authority: true
  },
  {
    id: 2,
    title: '개구리',
    level: 2,
    tags: 'if-statement',
    updatetime: '2021-12-31 18:20:29',
    authority: false
  },
  {
    id: 3,
    title: '올바른 괄호 문자열',
    level: 3,
    tags: 'if-statement',
    updatetime: '2021-12-31 18:20:29',
    authority: true
  },
  {
    id: 4,
    title: '많이 튼튼하지 않은 금고테스트',
    level: 4,
    tags: 'if-statement',
    updatetime: '2021-12-31 18:20:29',
    authority: true
  }
])

const sharedGroupField = [
  { key: 'id' },
  { key: 'name' },
  { key: 'manager' },
  { key: 'delete' }
]

type GroupInfos = {
  id?: number
  name: string
  manager?: string
  authority?: boolean
}[]

const sharedGroup = ref<GroupInfos>([
  {
    id: 1,
    name: 'NPC 초급반',
    manager: '홍길동',
    authority: true
  },
  {
    id: 2,
    name: 'NPC 고급반',
    manager: '박민서',
    authority: true
  },
  {
    id: 3,
    name: 'SKKUDING',
    manager: '김영훈',
    authority: false
  }
])

const radarData = {
  labels: [
    'DFS',
    'Hash',
    'Sorting',
    'BFS',
    'Greedy',
    'Brute-Force',
    'Dynamic Programming'
  ],
  datasets: [
    {
      label: 'tags',
      borderColor: '#8DC63F',
      data: [65, 20, 57, 55, 80, 91, 59]
    }
  ]
}

const radarOptions = {
  plugins: {
    legend: {
      display: false
    }
  }
}

const filterByLevel = (level: number) => {
  return problems.value.filter((x) => x.level === level).length
}

const barData = {
  labels: Array.from({ length: 7 }, (v, i) => 'Level' + (i + 1)),
  datasets: [
    {
      data: Array.from({ length: 7 }, (v, i) => filterByLevel(i + 1)),
      backgroundColor: [
        '#CC99C9',
        '#115A81',
        '#9EC1CF',
        '#B6EB8D',
        '#F3EC53',
        '#FEB144',
        '#FF6663'
      ]
    }
  ]
}

const barOptions = {
  scales: {
    y: {
      min: 0,
      max: problems.value.length,
      ticks: {
        stepSize: 1
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
}

const title = ref('그래프 문제 set')
const editTitle = ref(false)

const showSharingModal = ref<boolean>(false)
</script>

<template>
  <div v-if="!editTitle" class="mb-6 flex items-center">
    <div class="text-lg font-bold">
      {{ title }}
    </div>
    <Button
      class="ml-4 aspect-square"
      color="gray-dark"
      outline
      @click="editTitle = true"
    >
      <IconSolidPenToSquare />
    </Button>
  </div>
  <div v-else class="mb-6 flex items-center">
    <InputItem v-model="title" shadow @keyup.enter="editTitle = false" />
    <Button class="ml-4 aspect-square" @click="editTitle = false">
      <IconCheck />
    </Button>
  </div>

  <div class="flex items-center justify-center">
    <div class="w-1/2">
      <Radar :chart-data="radarData" :chart-options="radarOptions" />
    </div>
    <div class="w-1/2">
      <Bar :chart-data="barData" :chart-options="barOptions" />
    </div>
  </div>

  <div class="mt-10 flex">
    <PageTitle text="Problem List" />
    <Button
      class="ml-4"
      @click="() => $router.push('/manager/' + groupId + '/problem/create')"
    >
      + Create
    </Button>
    <Button class="ml-4">Import</Button>
  </div>
  <PaginationTable
    placeholder="keywords"
    :fields="problemFields"
    :items="problems"
    :number-of-pages="1"
    text="No Problem"
  >
    <template #level="{ row }">
      <div class="flex items-center gap-2">
        <span class="h-5 w-5 rounded-full" :class="colorMapper(row.level)" />
        Level {{ row.level }}
      </div>
    </template>
    <template #delete="{ row }">
      <Button
        v-if="row.authority"
        class="mr-1 aspect-square rounded-lg"
        outline
        color="gray-dark"
        @click="() => (problems = problems.filter((x) => x.id !== row.id))"
      >
        <IconTrashCan />
      </Button>
    </template>
  </PaginationTable>

  <div class="mt-10 flex">
    <PageTitle text="Shared Group" />
    <Button class="ml-4" @click="showSharingModal = true">Export</Button>
  </div>
  <PaginationTable
    :fields="sharedGroupField"
    :items="sharedGroup"
    :number-of-pages="1"
    text="No Group"
    no-search-bar
  >
    <template #delete="{ row }">
      <Button
        v-if="row.authority"
        class="mr-1 aspect-square rounded-lg"
        outline
        color="gray-dark"
        @click="
          () => (sharedGroup = sharedGroup.filter((x) => x.id !== row.id))
        "
      >
        <IconTrashCan />
      </Button>
    </template>
  </PaginationTable>

  <!-- Share Problem Pool Modal -->
  <SharePoolModal
    v-model:show-modal="showSharingModal"
    v-model:shared-group="sharedGroup"
    @update:shared-group="(value) => (sharedGroup = value)"
  />
</template>

<route lang="yaml">
meta:
  layout: admin
  group: skkuding
</route>
