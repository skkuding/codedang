<script setup lang="ts">
import Card from '@/common/components/Molecule/Card.vue'
import Button from '@/common/components/Atom/Button.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { computed, ref } from 'vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import IconPlus from '~icons/fa6-solid/plus'
import Sidebar from '../../component/Sidebar.vue'

interface Field {
  key: string
  label?: string
}
interface CardProps {
  title: string
  date?: string
  href: string
  state?: string
}
interface GroupItem {
  href: string
  title: string
  items: CardProps[]
}
type Type = Record<string, string>
const groupItems: GroupItem[] = [
  {
    href: '/',
    title: '초급반',
    items: [
      {
        title: 'npc 초급반 학생들이 있는 곳',
        state: 'IconAngleRight',
        href: '/'
      },
      { title: '20', state: 'IconAngleRight', href: '/' }
    ]
  },
  {
    href: '/',
    title: '중급반',
    items: [
      {
        title: 'npc 중급반 학생들이 있는 곳',
        state: 'IconAngleRight',
        href: '/'
      },
      { title: '20', state: 'IconAngleRight', href: '/' }
    ]
  },
  {
    href: '/',
    title: '고급반',
    items: [
      {
        title: 'npc 고급반 학생들이 있는 곳',
        state: 'IconAngleRight',
        href: '/'
      },
      { title: '20', state: 'IconAngleRight', href: '/' }
    ]
  }
]
const contestFields: Field[] = [
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
const workBookFields: Field[] = [
  { key: 'index', label: '#' },
  { key: 'title' },
  { key: 'group' },
  { key: 'period' }
]
const workBookItems: Type[] = [
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
const curContestItems = computed(() =>
  showContest.value.slice(
    (currentContestP.value - 1) * perPage,
    currentContestP.value * perPage
  )
)
const curWorkBookItems = computed(() =>
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
  <Sidebar />
  <div class="mt-10 mb-4 flex justify-between">
    <PageTitle text="Group List" />
    <Button
      class="flex items-center gap-1"
      color="green"
      @click="
        () => {
          $router.push('/')
        }
      "
    >
      <IconPlus />
      Create
    </Button>
  </div>
  <div class="flex flex-wrap justify-between gap-8">
    <div v-for="group in groupItems" :key="group.title">
      <Card :items="group.items" href="/group" class="w-full md:w-[48.5%]">
        <template #title>{{ group.title }}</template>
      </Card>
    </div>
  </div>
  <PageTitle text="Ongoing Contest" class="mt-10 mb-4" />
  <PaginationTable
    no-search-bar
    :fields="contestFields"
    :items="curContestItems"
    :number-of-pages="pageNumContest"
    @row-clicked="(data: Type) => $router.push('/contest/' + data.id)"
    @change-page="changeContest"
  ></PaginationTable>
  <PageTitle text="Ongoing Workbook" class="mt-10 mb-4" />
  <PaginationTable
    class="mb-4"
    no-search-bar
    :fields="workBookFields"
    :items="curWorkBookItems"
    :number-of-pages="pageNumWorkBook"
    @row-clicked="(data: Type) => $router.push('workbook/' + data.id)"
    @change-page="changeWorkBook"
  ></PaginationTable>
</template>
