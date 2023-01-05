<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import { ref } from 'vue'

const fields = [
  { key: 'id' },
  { key: 'title' },
  { key: 'difficulty' },
  { key: 'lastupdate' },
  { key: 'delete' }
]
const items = ref([
  {
    id: 1,
    title: '가파른 경사',
    difficulty: 'Level1',
    lastupdate: '2021-12-31 08:30:41'
  },
  {
    id: 2,
    title: '개구리',
    difficulty: 'Level2',
    lastupdate: '2021-12-31 08:30:42'
  },
  {
    id: 3,
    title: '올바른 괄호 문자열',
    difficulty: 'Level3',
    lastupdate: '2021-12-31 08:30:43'
  },
  {
    id: 4,
    title: '러브매칭',
    difficulty: 'Level4',
    lastupdate: '2021-12-31 08:30:44'
  },
  {
    id: 5,
    title: '많이 튼튼한 금고테스트',
    difficulty: 'Level5',
    lastupdate: '2021-12-31 08:30:45'
  }
])
</script>

<template>
  <main>
    <PageTitle text="Problem" class="pt-3" />
    <div class="flex gap-4 pl-44">
      <div class="flex gap-4">
        <Button>+ Create</Button>
        <Button>Import</Button>
      </div>
      <PageSubtitle class="ml-14 text-base" text="created by" />
    </div>
  </main>
  <PaginationTable
    :fields="fields"
    :items="items"
    :number-of-pages="5"
    text="No data"
  ></PaginationTable>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
