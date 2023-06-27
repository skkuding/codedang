<script setup lang="ts">
import { h, ref } from 'vue'
import { NTag, NButton, NIcon, NDataTable } from 'naive-ui'
import Fa6RegularTrashCan from '~icons/fa6-regular/trash-can'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'

interface Problem {
  id: number
  title: string
  difficulty: string
  tag: string[]
  lastUpdate: string
}

const deleteProblem = (row: Problem) => {
  console.log('delete Problem', row)
}

const columns = [
  {
    title: '#',
    key: 'id'
  },
  {
    title: 'Title',
    key: 'title',
    width: 400
  },
  {
    title: 'Difficulty',
    key: 'difficulty'
  },
  {
    title: 'Tag',
    key: 'tag',
    align: 'center' as const,
    render(row: Problem) {
      const tags = row.tag.map((tagKey) => {
        return h(
          NTag,
          {
            style: {
              marginRight: '6px'
            },
            type: 'success',
            bordered: false
          },
          {
            default: () => tagKey
          }
        )
      })
      return tags
    }
  },
  {
    title: 'LastUpdate',
    key: 'lastUpdate',
    width: 250
  },
  {
    title: 'Delete',
    key: 'delete',
    align: 'center' as const,
    render(row: Problem) {
      return h(NButton, {
        strong: true,
        size: 'small',
        bordered: true,
        onClick: () => deleteProblem(row),
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
      title: '가파른 경사',
      difficulty: 'Level1',
      tag: ['DP', 'DFS', 'BFS'],
      lastUpdate: '2022-08-28 18:00:00'
    })
    .map((item, index) => ({
      ...item,
      id: item.id + index
    }))
)
</script>

<template>
  <div class="flex flex-col">
    <PageTitle text="Problem List" class="mb-5" />
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
      row-class-name="font-bold text-base"
    />
  </div>
</template>
<route lang="yaml">
meta:
  layout: admin
</route>
