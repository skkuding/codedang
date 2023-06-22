<script setup lang="ts">
import { h, ref } from 'vue'
import { NButton, NSwitch, NIcon, NDataTable } from 'naive-ui'
import FaRegularTrashAlt from '~icons/fa-regular/trash-alt'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'

interface Contest {
  id: number
  group: string
  title: string
  type: string
  period: string
  visible: boolean
}

const deleteContest = (row: Contest) => {
  console.log('delete contest', row)
}

const toggleVisible = (row: Contest) => {
  row.visible = !row.visible
}

const columns = [
  {
    title: 'ID',
    key: 'id'
  },
  {
    title: 'Group',
    key: 'group'
  },
  {
    title: 'Type',
    key: 'type'
  },
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'Period',
    key: 'period',
    width: 250
  },
  {
    title: 'Visible',
    key: 'visible',
    align: 'center' as const,
    render(row: Contest) {
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
    render(row: Contest) {
      return h(NButton, {
        strong: true,
        size: 'small',
        bordered: true,
        onClick: () => deleteContest(row),
        renderIcon() {
          return h(NIcon, null, {
            default: () => h(FaRegularTrashAlt)
          })
        }
      })
    }
  }
]
const loading = ref(false)
const data = ref(
  Array(104)
    .fill({
      id: 1,
      group: 'NPC 초급반',
      type: 'ACM',
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
</script>

<template>
  <main class="flex flex-col">
    <PageTitle text="Contest List" class="mb-5" />
    <SearchBar placeholder="keywords" class="mb-5 self-end" />
    <n-data-table
      class="text-xl"
      :columns="columns"
      :data="data"
      :pagination="{
        pageSize: 5
      }"
      :loading="loading"
      :bordered="false"
      row-class-name="font-bold text-base"
    />
  </main>
</template>
<route lang="yaml">
meta:
  layout: admin
</route>
