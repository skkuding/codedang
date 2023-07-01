<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { onMounted, ref } from 'vue'
import Fa6SolidAngleRight from '~icons/fa6-solid/angle-right'
import Fa6SolidCircle from '~icons/fa6-solid/circle'
import Fa6SolidPlus from '~icons/fa6-solid/plus'
import IconTrash from '~icons/fa/trash-o'

const props = defineProps<{
  groupId: string
}>()

interface Contest {
  order: string
  id: string
  title: string
  period: string
  visible: boolean
}
interface PublicRequest {
  order: string
  id: string
  title: string
  status: string
}
const contestField = [
  {
    key: 'id',
    label: '#',
    width: '10%'
  },
  {
    key: 'title',
    width: '35%'
  },
  {
    key: 'period',
    width: '25%'
  },
  {
    key: 'visible',
    width: '15%'
  },
  {
    key: '_option',
    label: 'Option',
    width: '15%'
  }
]
const requestField = [
  {
    key: 'id',
    label: '#',
    width: '10%'
  },
  {
    key: 'title',
    width: '35%'
  },
  {
    key: 'status',
    width: '20%'
  },
  {
    key: '_option',
    label: 'Option',
    width: '15%'
  }
]
const statusPool: Record<string, string> = {
  PENDING: 'text-yellow',
  ACCEPT: 'text-green',
  REJECT: 'text-red'
}
const curContestPage = ref(1)
const curRequestPage = ref(1)

const pageSlot = 5
const perPage = 5
const totalPageContest = ref(3)
const totalPageRequest = ref(3)

const contestList = ref<Contest[][]>([])
const requestList = ref<PublicRequest[][]>([])

const currentContest = ref<Contest[]>([])
const currentRequest = ref<PublicRequest[]>([])

const changeContest = (page: number) => {
  let q = Math.floor((curContestPage.value - 1) / 5) * pageSlot
  if (q < page && page <= q + pageSlot) {
    curContestPage.value = page
    currentContest.value = contestList.value[(page - 1) % pageSlot]
    console.log('page', curContestPage.value)
  } else {
    curContestPage.value = page
    getContest(Math.floor((page - 1) / pageSlot) * perPage * pageSlot)
  }
}
const changeRequest = (page: number) => {
  let q = Math.floor((curRequestPage.value - 1) / 5) * pageSlot
  if (q < page && page <= q + pageSlot) {
    curRequestPage.value = page
    currentRequest.value = requestList.value[(page - 1) % pageSlot]
  } else {
    curRequestPage.value = page
    getPublicRequest(Math.floor((page - 1) / pageSlot) * perPage * pageSlot)
  }
}
const deleteContest = (id: string) => {
  console.log(id)
}
const switchToPublic = (id: string) => {
  console.log(id)
}
const deletePublicRequest = (id: string) => {
  console.log(id)
}
const getContest = (cursor: number) => {
  console.log(cursor)
  let res = [...Array(13).keys()].map((index: number) => {
    return {
      order: index + '',
      id: index > 2 ? index + '' : index + 1 + '',
      title: 'SKKU Coding Platform ',
      period: '2022-08-28 18:00:00 ~ 2022-08-28 22:00:00',
      visible: false
    }
  })

  contestList.value = []
  do {
    if (res.length === 0) return
    else if (res.length > perPage) {
      contestList.value.push(res.slice(0, perPage))
      res = res.splice(perPage)
    } else {
      contestList.value.push(res)
      res = res.splice(res.length + 1)
    }
  } while (res.length > 0)
  currentContest.value =
    contestList.value[(curContestPage.value - 1) % pageSlot]
}
const getPublicRequest = (cursor: number) => {
  console.log(cursor)
  let res = [...Array(13).keys()]
    .reverse()
    .map((item: number, index: number) => {
      return {
        order: index + '',
        id: item + 1 + '',
        title: 'SKKU Coding Platform ',
        status: Object.keys(statusPool)[item % 3]
      }
    })

  requestList.value = []
  do {
    if (res.length === 0) return
    else if (res.length > perPage) {
      requestList.value.push(res.slice(0, perPage))
      res = res.splice(perPage)
    } else {
      requestList.value.push(res)
      res = res.splice(res.length + 1)
    }
  } while (res.length > 0)
  currentRequest.value =
    requestList.value[(curContestPage.value - 1) % pageSlot]
}
onMounted(async () => {
  // call api
  await getContest(0)
  await getPublicRequest(0)
  // get number of pages
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center gap-2">
      <div class="text-2xl font-semibold">Contest List</div>
      <Button color="green" class="flex items-center gap-1">
        <Fa6SolidPlus class="item-center" />
        Create
      </Button>
    </div>
    <PaginationTable
      :fields="contestField"
      :items="currentContest"
      placeholder="keywords"
      :number-of-pages="totalPageContest"
      @change-page="changeContest"
      @row-clicked="
        (data) => $router.push(`/admin/${props.groupId}/contest/` + data.id)
      "
    >
      <template #visible="{ row }">
        <Switch
          v-model="
            contestList[(curContestPage - 1) % pageSlot][
              parseInt(row.order) % perPage
            ].visible
          "
          @click.stop=""
        />
      </template>
      <template #_option="{ row }">
        <div class="flex gap-2">
          <Button
            class="border-gray flex h-[32px] w-[32px] items-center justify-center border"
            color="white"
            @click.stop="deleteContest(row.id)"
          >
            <IconTrash />
          </Button>
          <Button
            class="border-gray flex h-[32px] w-[32px] items-center justify-center border"
            color="white"
            @click.stop="switchToPublic(row.id)"
          >
            <Fa6SolidAngleRight />
          </Button>
        </div>
      </template>
    </PaginationTable>

    <div class="mt-8 text-2xl font-semibold">Public Request</div>
    <PaginationTable
      :fields="requestField"
      :items="currentRequest"
      placeholder="keywords"
      :number-of-pages="totalPageRequest"
      @change-page="changeRequest"
      @row-clicked="
        (data) => $router.push(`/admin/${props.groupId}/contest/` + data.id)
      "
    >
      <template #status="{ row }">
        <div
          class="border-gray flex w-fit cursor-default items-center justify-center gap-2 rounded border px-2 py-1 text-sm"
          @click.stop=""
        >
          <Fa6SolidCircle
            :class="statusPool[row.status]"
            class="fill-current"
          />
          {{
            row.status
              .toLowerCase()
              .replace(/\b[a-z]/, (char) => char.toUpperCase())
          }}
        </div>
      </template>
      <template #_option="{ row }">
        <Button
          class="border-gray flex h-[32px] w-[32px] items-center justify-center border"
          color="white"
          @click.stop="deletePublicRequest(row.id)"
        >
          <IconTrash />
        </Button>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
