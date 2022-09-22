<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Sidebar from '@/admin/component/Sidebar.vue'
import { computed, ref } from 'vue'

const groupItems1 = [
  {
    title: 'npc 초급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 20명',
    href: '/'
  }
]
const groupItems2 = [
  {
    title: 'npc 중급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 23명',
    href: '/'
  }
]
const groupItems3 = [
  {
    title: 'npc 고급반 학생들이 있는 곳',
    href: '/'
  },
  {
    title: 'member: 20명',
    href: '/'
  }
]
const contestFields = [
  { key: 'index', label: '#' },
  { key: 'title' },
  { key: 'group' },
  { key: 'period' },
  { key: 'type' }
]
// id: api에 넘겨줄 item id, index: display index
const contestItems = [
  {
    id: '1',
    index: '1',
    title: '2022 SKKU 프로그래밍 대회',
    group: 'NPC 고급반',
    period: '2022- 08-28 18:00:00 ~ 08-28 22:00:00',
    type: 'ACM'
  },
  {
    id: '2',
    index: '2',
    title: '1차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00',
    type: 'ACM'
  },
  {
    id: '3',
    index: '3',
    title: '2차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00',
    type: 'ACM'
  },
  {
    id: '4',
    index: '4',
    title: '3차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00',
    type: 'ACM'
  }
]
const workBookFields = [
  { key: 'index', label: '#' },
  { key: 'title' },
  { key: 'group' },
  { key: 'period' }
]
const workBookItems = [
  {
    id: '1',
    index: '1',
    title: '2022 SKKU 프로그래밍 대회',
    group: 'NPC 고급반',
    period: '2022- 08-28 18:00:00 ~ 08-28 22:00:00'
  },
  {
    id: '2',
    index: '2',
    title: '1차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00'
  },
  {
    id: '3',
    index: '3',
    title: '2차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00'
  },
  {
    id: '4',
    index: '4',
    title: '3차 모의 대회',
    group: 'NPC 고급반',
    period: '2022-08-27 18:00:00 ~ 08-30 22:00:00'
  }
]
const perPage = 3
const pageNumContest = ref(
  contestItems.length % perPage === 0
    ? contestItems.length / perPage
    : Math.floor(contestItems.length / perPage) + 1
)
const pageNumWorkBook = ref(
  workBookItems.length % perPage === 0
    ? workBookItems.length / perPage
    : Math.floor(workBookItems.length / perPage) + 1
)
const showContest = ref(contestItems)
const showWorkBook = ref(workBookItems)
const currentContestP = ref(1)
const currentWorkBookP = ref(1)
let curContestItems = computed(() =>
  showContest.value.slice(
    (currentContestP.value - 1) * perPage,
    currentContestP.value * perPage
  )
)
let curWorkBookItems = computed(() =>
  showWorkBook.value.slice(
    (currentWorkBookP.value - 1) * perPage,
    currentWorkBookP.value * perPage
  )
)
const changeContest = (page: number) => {
  currentContestP.value = page
}
const changeWorkBook = (page: number) => {
  currentWorkBookP.value = page
}
</script>

<template>
  <Sidebar class="fixed left-0"></Sidebar>
  <!-- <Card href="#" :items="groupItems1" class="ml-20 w-1/3">
    <template #title>NPC 초급반</template>
  </Card>

  <Card href="#" :items="groupItems2" class="ml-80 w-1/3">
    <template #title>NPC 중급반</template>
  </Card>

  <Card href="#" :items="groupItems3" class="ml-20 w-1/3">
    <template #title>NPC 고급반</template>
  </Card> -->
  <PaginationTable
    noSearchBar
    :fields="contestFields"
    :items="curContestItems"
    :number-of-pages="pageNumContest"
    @row-clicked="(data) => $router.push('contest/' + data.id)"
    @change-page="changeContest"
  ></PaginationTable>
  <PaginationTable
    noSearchBar
    :fields="workBookFields"
    :items="curWorkBookItems"
    :number-of-pages="pageNumWorkBook"
    @row-clicked="(data) => $router.push('workbook/' + data.id)"
    @change-page="changeWorkBook"
  ></PaginationTable>
</template>
