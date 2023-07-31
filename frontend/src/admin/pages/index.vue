<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Card from '@/common/components/Molecule/Card.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useToast } from '@/common/composables/toast'
import { useQuery } from '@vue/apollo-composable'
import axios from 'axios'
import gql from 'graphql-tag'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import IconAngleRight from '~icons/fa6-solid/angle-right'

// Types
type GetGroupsResponse = {
  getGroups: {
    id: string
    groupName: string
    description: string
    memberNum: number
    config: {
      showOnList: boolean
      allowJoinWithURL: boolean
      allowJoinFromSearch: boolean
      requireApprovalBeforeJoin: boolean
    }
  }[]
}
type WorkBookItem = Record<string, string>

const openToast = useToast()
const router = useRouter()
const authorization = axios.defaults.headers.common.authorization
if (authorization === undefined) {
  router.push('/')
}
const { result, error } = useQuery<GetGroupsResponse>(
  gql`
    query Group {
      getGroups(take: 3) {
        id
        groupName
        description
        config
        memberNum
      }
    }
  `,
  null,
  {
    errorPolicy: 'all',
    context: {
      headers: {
        Authorization: axios.defaults.headers.common.authorization
      }
    }
  }
)
watch(error, (value) => {
  if (value) {
    router.push('/')
  }
})
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
const workBookItems: WorkBookItem[] = [
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
  <div class="mb-4 flex justify-between">
    <PageTitle text="Group List" />
    <Button
      class="flex items-center gap-1"
      color="green"
      @click="
        () => {
          openToast({ message: '아직 구현되지 않았습니다ㅜㅜ', type: 'warn' })
        }
      "
    >
      + Create
    </Button>
  </div>
  <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
    <div v-for="group in result ? result.getGroups : []" :key="group.id">
      <Card
        :items="[
          { title: group.description },
          { title: `member: ${group.memberNum}명` }
        ]"
        :href="`/admin/${group.id}`"
      >
        <template #title>
          <div class="cursor-pointer hover:opacity-50 active:opacity-30">
            {{ group.groupName }}
          </div>
        </template>
        <template #icon>
          <IconAngleRight />
        </template>
      </Card>
    </div>
  </div>
  <PageTitle text="Ongoing Contest" class="mb-4 mt-10" />
  <PaginationTable
    no-search-bar
    :fields="contestFields"
    :items="curContestItems"
    :number-of-pages="pageNumContest"
    @row-clicked="(data: WorkBookItem) => $router.push('/contest/' + data.id)"
    @change-page="changeContest"
  />
  <PageTitle text="Ongoing Workbook" class="mb-4 mt-10" />
  <PaginationTable
    class="mb-4"
    no-search-bar
    :fields="workBookFields"
    :items="curWorkBookItems"
    :number-of-pages="pageNumWorkBook"
    @row-clicked="(data: WorkBookItem) => $router.push('workbook/' + data.id)"
    @change-page="changeWorkBook"
  />
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
