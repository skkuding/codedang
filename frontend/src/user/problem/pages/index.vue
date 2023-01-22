<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import Button from '@/common/components/Atom/Button.vue'
import { ref, computed, onMounted } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { useToast } from '@/common/composables/toast'
import axios from 'axios'

interface Problem {
  id: number
  title: string
  level: number
  submissions: number
  rate: string
  tags: string
}

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

const showTags = ref(false)
const fields = computed(() =>
  showTags.value
    ? [
        { key: 'id', label: '#' },
        { key: 'title' },
        { key: 'level' },
        { key: 'submissions' },
        { key: 'rate', label: 'AC Rate' },
        { key: 'tags' }
      ]
    : [
        { key: 'id', label: '#' },
        { key: 'title' },
        { key: 'level' },
        { key: 'submissions' },
        { key: 'rate', label: 'AC Rate' }
      ]
)

const problemList = ref<Problem[]>([])
problemList.value = [
  {
    id: 1,
    title: '가파른 경사',
    level: 1,
    submissions: 132,
    rate: '92.14%',
    tags: 'A'
  },
  {
    id: 1006,
    title: '습격자 호루라기',
    level: 2,
    submissions: 561,
    rate: '70%',
    tags: 'B'
  },
  {
    id: 10,
    title: '아싸 홍삼',
    level: 1,
    submissions: 100,
    rate: '90%',
    tags: 'E'
  },
  {
    id: 11,
    title: '에브리바디 홍상',
    level: 2,
    submissions: 100,
    rate: '83%',
    tags: 'C'
  },
  {
    id: 12,
    title: '나는 토깽이',
    level: 3,
    submissions: 100,
    rate: '72%',
    tags: 'D'
  },
  {
    id: 13,
    title: '나는 거부깅',
    level: 4,
    submissions: 100,
    rate: '65%',
    tags: 'F'
  },
  {
    id: 14,
    title: '토깽이 둘',
    level: 5,
    submissions: 100,
    rate: '52%',
    tags: 'G'
  },
  {
    id: 15,
    title: '토깽이 토깽이',
    level: 6,
    submissions: 100,
    rate: '1%',
    tags: 'H'
  },
  {
    id: 16,
    title: '아싸 토깽 에브리바디 토깽',
    level: 7,
    submissions: 100,
    rate: '1%',
    tags: 'I'
  },
  {
    id: 17,
    title: '토깽이 토깽이',
    level: 7,
    submissions: 100,
    rate: '1%',
    tags: 'J'
  }
]

type Workbook = {
  id: number
  title: string
  description: string
  updateTime: string
}

const workbookList = ref<Workbook[]>([])

// const res = await axios.get('api/workbook')
// workbookList.value = res.data

const openToast = useToast()

onMounted(async () => {
  await axios
    .get('api/workbook')
    .then((res) => {
      workbookList.value = res.data
    })
    .catch((err) => {
      openToast({ message: err.message, type: 'error' })
    })
})

const cardItems = [
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.03.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 4
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 5
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  }
]

const numberOfCards = ref(4)
const clickMore = () => {
  window.innerWidth < 768
    ? (numberOfCards.value = Math.min(
        numberOfCards.value + 2,
        cardItems.length
      ))
    : (numberOfCards.value = Math.min(
        numberOfCards.value + 4,
        cardItems.length
      ))
  // TODO: workbook 요청 개수만큼 추가로 받아오기
}
</script>

<template>
  <PageSubtitle text="All Problem" class="mt-10 mb-2" />
  <PaginationTable
    :fields="fields"
    :items="problemList"
    placeholder="keywords"
    :number-of-pages="1"
    @row-clicked="({ id }) => $router.push('/problem/' + id)"
  >
    <template #option>
      <Switch v-model="showTags" label="Tags" />
    </template>
    <template #level="{ row }">
      <div class="flex items-center gap-2">
        <span class="h-5 w-5 rounded-full" :class="colorMapper(row.level)" />
        Level {{ row.level }}
      </div>
    </template>
  </PaginationTable>

  <PageSubtitle text="Workbook" class="mt-10 mb-2" />
  <div class="flex justify-end">
    <SearchBar class="mb-5" placeholder="keywords" />
  </div>
  <div v-if="workbookList.length === 0">No Workbook</div>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <ProgressCard
      v-for="(workbook, index) in workbookList"
      :key="index"
      :title="workbook.title"
      :header="
        useDateFormat(workbook.updateTime, 'YYYY.MM.DD').value + ' updated'
      "
      :description="workbook.description"
      color="#94D0AD"
      :total="6"
      :complete="1"
      @click="() => $router.push('/workbook/' + workbook.id)"
    />
  </div>
  <Button
    v-if="numberOfCards < cardItems.length"
    outline
    color="gray-dark"
    class="mt-8 mb-20 w-full"
    @click="clickMore"
  >
    More
  </Button>
</template>

<route lang="yaml">
meta:
  title: Problem
  subtitle: Find problems with problem set and filters, and solve it!
</route>
