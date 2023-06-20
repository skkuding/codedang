<script setup lang="ts">
import { h } from 'vue'
import { NButton, NSwitch, NIcon } from 'naive-ui'
import FaRegularTrashAlt from '~icons/fa-regular/trash-alt'

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
  console.log('toggle visible', row)
}

const columns = [
  {
    title: 'ID',
    key: 'id',
    width: 50
  },
  {
    title: 'Group',
    key: 'group',
    resizable: true
  },
  {
    title: 'Type',
    key: 'type',
    resizable: true,
    minWidth: 50,
    maxWidth: 100
  },
  {
    title: 'Title',
    key: 'title'
  },
  {
    title: 'Period',
    key: 'period'
  },
  {
    title: 'Visible',
    key: 'visible',
    render(row: Contest) {
      return h(NSwitch, {
        strong: true,
        tertiary: true,
        size: 'small',
        onClick: () => toggleVisible(row)
      })
    }
  },
  {
    title: 'Delete',
    key: 'delete',
    render(row: Contest) {
      return h(NButton, {
        strong: true,
        tertiary: true,
        size: 'small',
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

const data = [
  {
    id: 1,
    group: 'NPC 초급반',
    type: 'ACM',
    title: '2차 모의대회',
    period: '2022-08-22',
    visible: false
  },
  {
    id: 2,
    group: 'NPC 초급반',
    type: 'ACM',
    title: '2차 모의대회',
    period: '2022-08-22',
    visible: false
  },
  {
    id: 3,
    group: 'NPC 초급반',
    type: 'ACM',
    title: '2차 모의대회',
    period: '2022-08-22',
    visible: false
  }
]
</script>

<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :pagination="{
      pageSize: 3
    }"
    :bordered="false"
  />
</template>
<route lang="yaml">
meta:
  layout: admin
</route>
