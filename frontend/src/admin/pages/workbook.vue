<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

interface Workbook {
  id: number
  group: string
  label: string
  period: string
  visible: boolean
}

//TODO: 워크북 삭제 및 visible 토글 기능 넣기
const deleteWorkbook = (row: Workbook) => {
  console.log('delete Workbook', row)
}

const toggleVisible = (row: Workbook) => {
  row.visible = !row.visible
}
const onoff = ref(true)

const columns = [
  {
    label: '#',
    key: 'id',
    width: '8%'
  },
  {
    label: 'Group',
    key: 'group',
    width: '15%'
  },
  {
    label: 'Title',
    key: 'title',
    width: '30%'
  },
  {
    label: 'Period',
    key: 'period',
    width: '30%'
  },
  {
    label: 'Visible',
    key: 'visible',
    width: '8%'
  },
  {
    label: 'Delete',
    key: 'delete',
    width: '8%'
  }
]

const pageSlot = 5
const curWorkbookPage = ref(1)
const totalPageWorkbook = ref(1)

//TODO: api 연결 후 개수 컷하기. 현재 id가 같은 걸 어레이로 반복 뿌리기만 해서 아이디로 자를 수 없음.
const changeWorkbook = (page: number) => {
  let q = Math.floor((curWorkbookPage.value - 1) / 5) * pageSlot
  if (q < page && page <= q + pageSlot) {
    curWorkbookPage.value = page
    // currentWorkbook.value = contestList.value[(page - 1) % pageSlot]
  } else {
    curWorkbookPage.value = page
    // getWorkbook(Math.floor((page - 1) / pageSlot) * perPage * pageSlot)
  }
}

const data = ref(
  Array(10)
    .fill({
      id: 1,
      group: 'NPC 초급반',
      title: 'SKKU Coding Platform 2차모의대회',
      period: '2022-08-28 18:00:00 ~ 2022-08-28 22:00:00',
      visible: false
    })
    .map((item, index) => ({
      ...item,
      id: item.id + index,
      visible: index % 2 ? false : true
    }))
)
// <!-- key, label, width -->
</script>

<template>
  <div class="flex flex-col">
    <PageTitle text="Workbook List" class="mb-5" />
    <!-- <SearchBar placeholder="keywords" class="mb-5 self-end" /> -->
    <PaginationTable
      :fields="columns"
      :items="data"
      placeholder="keywords"
      :number-of-pages="totalPageWorkbook"
      @change-page="changeWorkbook"
      @row-clicked="() => $router.push(`/admin/`)"
    >
      <template #visible="{}">
        <Switch v-model="onoff" @click.stop="toggleVisible" />
      </template>
      <template #delete="{}">
        <Button
          class="flex h-[32px] w-[32px] items-center justify-center"
          @click.stop="deleteWorkbook"
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
