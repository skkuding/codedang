<script setup lang="ts">
import { h, ref } from 'vue'
import { NButton, NSwitch, NIcon, NDataTable } from 'naive-ui'
import Fa6RegularTrashCan from '~icons/fa6-regular/trash-can'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'

interface Notice {
  id: number
  group: string
  title: string
  lastUpdate: string
  visible: boolean
}

const deleteNotice = (row: Notice) => {
  console.log('delete notice', row)
}

const toggleVisible = (row: Notice) => {
  row.visible = !row.visible
}

const columns = [
  {
    title: '#',
    key: 'id',
    minWidth: 80
  },
  {
    title: 'Group',
    key: 'group',
    minWidth: 150
  },
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'LastUpdate',
    key: 'lastUpdate',
    width: 220
  },
  {
    title: 'Visible',
    key: 'visible',
    align: 'center' as const,
    width: 120,
    render(row: Notice) {
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
    render(row: Notice) {
      return h(NButton, {
        strong: true,
        size: 'small',
        bordered: true,
        onClick: () => deleteNotice(row),
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
const data = ref(
  Array(104)
    .fill({
      id: 1,
      group: 'NPC 초급반',
      title: 'SKKU Coding Platform 2차모의대회',
      lastUpdate: '2022-08-28 18:00:00',
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
    <PageTitle text="Notice List" class="mb-5" />
    <SearchBar placeholder="keywords" class="mb-5 self-end" />
    <n-data-table
      :columns="columns"
      :data="data"
      :loading="loading"
      :pagination="{
        pageSize: 5
      }"
      :scroll-x="1100"
      :bordered="false"
      class="text-xl"
      row-class-name="font-bold text-base h-20"
    />
  </div>
</template>
<route lang="yaml">
meta:
  layout: admin
</route>
