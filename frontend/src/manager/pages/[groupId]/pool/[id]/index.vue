<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconSolidPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import IconCheck from '~icons/fa6-solid/check'
import { ref } from 'vue'

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

const sharedGroup = ref([
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
    id: 1,
    name: 'SKKUDING',
    manager: '김영훈',
    authority: false
  }
])

const title = ref('그래프 문제 set')
const editTitle = ref(false)
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
  <div class="h-80 w-full"></div>

  <div class="mt-10 flex">
    <PageTitle text="Problem List" />
    <Button class="ml-4">+ Create</Button>
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
      >
        <IconTrashCan />
      </Button>
    </template>
  </PaginationTable>

  <div class="mt-10 flex">
    <PageTitle text="Shared Group" />
    <Button class="ml-4">Export</Button>
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
      >
        <IconTrashCan />
      </Button>
    </template>
  </PaginationTable>
</template>

<route lang="yaml">
meta:
  layout: admin
  group: skkuding
</route>
