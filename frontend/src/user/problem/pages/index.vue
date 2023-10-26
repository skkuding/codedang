<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Spinner from '@/common/components/Atom/Spinner.vue'
// import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
// import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
// import { useDateFormat } from '@vueuse/core'
// import { useWindowSize } from '@vueuse/core'
import { ref, computed } from 'vue'

// import { onMounted } from 'vue'
// import { useWorkbook } from '../../workbook/composables/workbook'

interface Problem {
  id: number
  title: string
  difficulty: string
  submissions: number
  rate: string
  tags: Record<string, string>[]
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
    default:
      return 'bg-gray'
  }
}

const showTags = ref(false)
const commonField = [
  { key: 'id', label: '#', width: '100px' },
  { key: 'title' },
  { key: 'level' },
  { key: 'submissionCount', label: 'submissions' },
  { key: 'acceptedRate', label: 'AC Rate' }
]
const fields = computed(() =>
  showTags.value ? [...commonField, { key: 'tags', label: 'Tag' }] : commonField
)

const { items, totalPages, changePage, loading } =
  useListAPI<Problem>('problem')

// hide
// const CARD_COLOR = ['#FFE5CC', '#94D0AD', '#FFCDCD', '#B1DDEB']

// const { containLastItem, workbookList, getWorkbooks, getMoreWorkbooks } =
//   useWorkbook()

// onMounted(async () => {
//   await getWorkbooks()
// })
</script>

<template>
  <PageSubtitle text="All Problem" class="mb-2 mt-10" />
  <div v-if="loading" class="my-20 flex justify-center">
    <Spinner color="blue" />
  </div>
  <PaginationTable
    v-else
    :fields="fields"
    :items="items"
    placeholder="keywords"
    :number-of-pages="totalPages"
    @change-page="changePage"
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
    <template #tags="{ row }">
      <div v-if="row.tags.length === 0" class="m-0.5">-</div>
      <div v-else>
        <div v-for="{ id, name } in row.tags" :key="id" class="flex">
          <Button color="green" class="m-0.5 cursor-default" @click.stop="">
            {{ name }}
          </Button>
        </div>
      </div>
    </template>
  </PaginationTable>

  <!-- hide -->
  <!-- <PageSubtitle text="Workbook" class="mb-2 mt-10" />
  <div class="flex justify-end">
    <SearchBar class="mb-5" placeholder="keywords" />
  </div>
  <div v-if="workbookList.length === 0">No Workbook</div>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    TODO: submission 기록 (total, complete) 가져오기
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
  </Button> -->
</template>

<route lang="yaml">
meta:
  title: Problem
  subtitle: Find problems with problem set and filters, and solve it!
</route>
