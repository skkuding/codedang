<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { NButton, NSwitch, NIcon, NDataTable } from 'naive-ui'
import { h, ref } from 'vue'
import Fa6RegularTrashCan from '~icons/fa6-regular/trash-can'

interface Workbook {
  id: number
  title: string
  visible: boolean
}

const deleteWorkbook = (row: Workbook) => {
  console.log('delete Workbook', row)
}

const toggleVisible = (row: Workbook) => {
  row.visible = !row.visible
}

const columns = [
  {
    title: '#',
    key: 'id',
    minWidth: 80
  },
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'Visible',
    key: 'visible',
    align: 'center' as const,
    width: 120,
    render(row: Workbook) {
      return h(NSwitch, {
        strong: true,
        tertiary: true,
        value: row.visible,
        size: 'small',
        onClick: () => toggleVisible(row)
      })
    }
  },
  {
    title: 'Delete',
    key: 'delete',
    align: 'center' as const,
    width: 120,
    render(row: Workbook) {
      return h(NButton, {
        strong: true,
        size: 'small',
        bordered: true,
        onClick: () => deleteWorkbook(row),
        renderIcon() {
          return h(NIcon, null, {
            default: () => h(Fa6RegularTrashCan)
          })
        }
      })
    }
  }
]
const loading = ref(false)
const currentPage = ref(1)

const data = ref(
  Array(104)
    .fill({
      id: 1,
      title: 'SKKU Coding Platform 2차모의대회',
      visible: false
    })
    .map((item, index) => ({
      ...item,
      id: item.id + index,
      visible: index % 2 ? false : true
    }))
)
</script>

<template>
  <div class="flex flex-col">
    <PageTitle text="Workbook List" class="mb-5" />
    <SearchBar placeholder="keywords" class="mb-5 self-end" />
    <n-data-table
      :columns="columns"
      :data="data.slice((currentPage - 1) * 5, currentPage * 5)"
      :loading="loading"
      :scroll-x="1100"
      :bordered="false"
      class="text-xl"
      row-class-name="text-base"
    />
    <Pagination
      v-model="currentPage"
      :number-of-pages="6"
      class="mt-10 self-end"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
