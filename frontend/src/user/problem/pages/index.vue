<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import Button from '@/common/components/Atom/Button.vue'
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'

interface Problem {
  id: number
  title: string
  difficulty: string
}

const colorMapper = (level: string) => {
  switch (level) {
    case 'Level1':
      return 'bg-level-1'
    case 'Level2':
      return 'bg-level-2'
    case 'Level3':
      return 'bg-level-3'
    case 'Level4':
      return 'bg-level-4'
    case 'Level5':
      return 'bg-level-5'
    case 'Level6':
      return 'bg-level-6'
    case 'Level7':
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
    difficulty: 'Level 1'
  }
]

onMounted(() => {
  axios
    .get(`/api/problem?offset=0&limit=10`)
    .then((res) => {
      problemList.value = res.data
    })
    .catch((err) => console.log('error is ', err))
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
        <span
          class="h-5 w-5 rounded-full"
          :class="colorMapper(row.difficulty)"
        />
        {{ row.difficulty }}
      </div>
    </template>
  </PaginationTable>

  <PageSubtitle text="Workbook" class="mt-10 mb-2" />
  <div class="flex justify-end">
    <SearchBar class="mb-5" placeholder="keywords" />
  </div>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <ProgressCard
      v-for="index in numberOfCards"
      :key="index"
      :title="cardItems[index - 1].title"
      :header="cardItems[index - 1].header"
      :description="cardItems[index - 1].description"
      :color="cardItems[index - 1].color"
      :total="cardItems[index - 1].total"
      :complete="cardItems[index - 1].complete"
      @click="() => $router.push('/workbook/' + index)"
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
