<script setup lang="ts">
import WorkbookTitle from '../components/WorkbookTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import IconCheck from '~icons/fa6-regular/circle-check'
import { computed, onMounted, ref } from 'vue'
import { useWorkbook } from '../composables/workbook'
import { useRouter } from 'vue-router'

// TODO: define interface in separte file
interface Problem {
  id: number
  title: string
  tags: string
  result: string
}

const props = defineProps<{
  id: string
}>()

const showTags = ref(false)
const fields = computed(() =>
  showTags.value
    ? [{ key: 'id', label: '#' }, { key: 'title' }, { key: 'tags' }]
    : [{ key: 'id', label: '#' }, { key: 'title' }]
)

const workbookProblemList = ref<Problem[]>([])

// TODO: use API to get workbook-problem list of initial page

workbookProblemList.value = [
  {
    id: 1,
    title: '가파른 경사',
    tags: 'if-statement',
    result: 'accepted'
  },
  {
    id: 1006,
    title: '습격자 호루라기',
    tags: 'dfs',
    result: 'accepted'
  },
  {
    id: 10,
    title: '아싸 홍삼',
    tags: 'dynamic programming',
    result: 'wrong answer'
  },
  {
    id: 11,
    title: '에브리바디 홍상',
    tags: 'for-loop',
    result: 'wrong answer'
  },
  {
    id: 12,
    title: '나는 토깽이',
    tags: 'greedy',
    result: ''
  },
  {
    id: 13,
    title: '나는 거부깅',
    tags: 'brute force',
    result: ''
  },
  {
    id: 14,
    title: '토깽이 둘',
    tags: 'binary tree',
    result: ''
  },
  {
    id: 15,
    title: '토깽이 토깽이',
    tags: 'bfs',
    result: 'accepted'
  },
  {
    id: 16,
    title: '아싸 토깽 에브리바디 토깽',
    tags: 'dfs',
    result: ''
  },
  {
    id: 17,
    title: '토깽이 토깽이',
    tags: 'if-statement',
    result: ''
  }
]

// TODO: implement change-page function to reset workbookProblemList using API when click pagination buttons

const router = useRouter()
const { workbook, getWorkbook } = useWorkbook()

onMounted(async () => {
  try {
    await getWorkbook(parseInt(props.id))
  } catch (err) {
    router.replace('/404')
  }
})
</script>

<template>
  <div class="my-10">
    <WorkbookTitle :text="workbook?.title || ''" color="red" class="mb-2" />
    <PaginationTable
      :fields="fields"
      :items="workbookProblemList"
      :number-of-pages="1"
      no-search-bar
      @row-clicked="({ id }) => $router.push('/problem/' + id)"
    >
      <template #option>
        <Switch v-model="showTags" label="Tags" />
      </template>

      <template #title="{ row }">
        <div class="flex items-center gap-2">
          {{ row.title }}
          <IconCheck v-if="row.result === 'accepted'" class="text-green" />
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
