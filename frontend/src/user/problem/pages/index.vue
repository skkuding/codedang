<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import Button from '@/common/components/Atom/Button.vue'
import { ref, computed, onMounted } from 'vue'
import { useDateFormat } from '@vueuse/core'
import { useWorkbook } from '../../workbook/composables/workbook'
import { useWindowSize } from '@vueuse/core'
import axios from 'axios'

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
problemList.value = []
const take = ref(10) // 10개씩
const cursor = ref(0)
const hasNextPage = ref(true)

onMounted(async () => {
  axios
    .get(
      cursor.value
        ? `/api/problem?cursor=${cursor.value}&take=${take.value}`
        : `/api/problem?take=${take.value}`,
      {
        headers: {}
      }
    )
    .then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        res.data[i].createTime = res.data[i].createTime.toString().slice(0, 10)
      }
      console.log('res is ', res)
      problemList.value.push(...res.data)
      if (res.data.length < take.value) {
        hasNextPage.value = false
      }
    })
    .catch((err) => console.log('error is ', err))

  // try {
  //   const problemResponse = await axios.get(`/api/problem?offset=0&limit=10`)
  //   problemList.value = problemResponse.data
  // } catch (err) {
  //   console.log(err)
  // }
})

const CARD_COLOR = ['#FFE5CC', '#94D0AD', '#FFCDCD', '#B1DDEB']

const { containLastItem, workbookList, getWorkbooks, getMoreWorkbooks } =
  useWorkbook()

onMounted(async () => {
  await getWorkbooks()
})
</script>

<template>
  <PageSubtitle text="All Problem" class="mb-2 mt-10" />
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

  <PageSubtitle text="Workbook" class="mb-2 mt-10" />
  <div class="flex justify-end">
    <SearchBar class="mb-5" placeholder="keywords" />
  </div>
  <div v-if="workbookList.length === 0">No Workbook</div>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <!-- TODO: submission 기록 (total, complete) 가져오기 -->
    <ProgressCard
      v-for="(workbook, index) in workbookList"
      :key="index"
      :title="workbook.title"
      :header="
        useDateFormat(workbook.updateTime, 'YYYY.MM.DD').value + ' updated'
      "
      :description="workbook.description"
      :color="CARD_COLOR[workbook.id % 4]"
      :total="6"
      :complete="1"
      @click="$router.push('/workbook/' + workbook.id)"
    />
  </div>
  <Button
    v-if="!containLastItem"
    outline
    color="gray-dark"
    class="mb-20 mt-8 w-full"
    @click="getMoreWorkbooks(useWindowSize().width.value < 768 ? 2 : 4)"
  >
    More
  </Button>
</template>

<route lang="yaml">
meta:
  title: Problem
  subtitle: Find problems with problem set and filters, and solve it!
</route>
