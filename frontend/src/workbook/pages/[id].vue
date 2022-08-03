<script setup lang="ts">
import WorkbookTitle from '../components/WorkbookTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

defineProps<{
  id: number
}>()

const fields = [
  { key: 'id', label: '#' },
  { key: 'title' },
  { key: 'level' },
  { key: 'submissions' },
  { key: 'rate', label: 'AC Rate' }
]

const colorMapper = {
  1: 'bg-level-1',
  2: 'bg-level-2',
  3: 'bg-level-3',
  4: 'bg-level-4',
  5: 'bg-level-5',
  6: 'bg-level-6',
  7: 'bg-level-7'
}

// example items
const items = [
  { id: 1, title: '가파른 경사', level: 1, submissions: 132, rate: '92.14%' },
  {
    id: 1006,
    title: '습격자 호루라기',
    level: 2,
    submissions: 561,
    rate: '0.61%'
  },
  { id: 10, title: '아싸 홍삼', level: 1, submissions: 100, rate: '90%' },
  {
    id: 11,
    title: '에브리바디 홍상',
    level: 2,
    submissions: 100,
    rate: '83%'
  },
  { id: 12, title: '나는 토깽이', level: 3, submissions: 100, rate: '72%' },
  { id: 13, title: '나는 거부깅', level: 4, submissions: 100, rate: '65%' },
  { id: 14, title: '토깽이 둘', level: 5, submissions: 100, rate: '52%' },
  { id: 15, title: '토깽이 토깽이', level: 6, submissions: 100, rate: '1%' },
  {
    id: 16,
    title: '아싸 토깽 에브리바디 토깽',
    level: 7,
    submissions: 100,
    rate: '1%'
  },
  { id: 17, title: '토깽이 토깽이', level: 7, submissions: 100, rate: '1%' }
]

const clickRow = (row: any) => {
  window.location.href = '/problem/' + row.id
}
</script>

<template>
  <div class="my-16">
    <WorkbookTitle text="CATS 대비 문제집 Level 1" color="red" class="mb-7" />
    <PaginationTable
      :fields="fields"
      :items="items"
      placeholder="keywords"
      :number-of-pages="1"
      no-search-bar
      @row-clicked="clickRow"
    >
      <template #level="{ row }">
        <div class="flex items-center gap-2">
          <span class="h-5 w-5 rounded-full" :class="colorMapper[row.level]" />
          Level {{ row.level }}
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
