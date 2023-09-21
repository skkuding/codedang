<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { NTag, NCard, NButton, NIcon, NDataTable } from 'naive-ui'
import { h, ref } from 'vue'
import Fa6RegularTrashCan from '~icons/fa6-regular/trash-can'

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
    key: 'id',
    minWidth: 80
  },
  {
    title: 'Title',
    key: 'title',
    minWidth: 300
  },
  {
    title: 'Difficulty',
    key: 'difficulty',
    align: 'center' as const,
    width: 150
  },
  {
    title: 'Tag',
    key: 'tag',
    align: 'center' as const,
    width: 250,
    render(row: Problem) {
      const tags = row.tag.map((tagKey) => {
        return h(
          NTag,
          {
            type: 'success',
            bordered: false,
            style: {
              fontSize: '1rem'
            }
          },
          {
            default: () => tagKey
          }
        )
      })
      return h(
        NCard,
        {
          bordered: false,
          style: {
            background: 'transparent'
          },
          contentStyle: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            justifyContent: 'center',
            padding: '0'
          }
        },
        {
          default: () => tags
        }
      )
    }
  },
  {
    title: 'LastUpdate',
    key: 'lastUpdate',
    width: 220
  },
  {
    title: 'Delete',
    key: 'delete',
    align: 'center' as const,
    width: 120,
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
const currentPage = ref(1)
const data = ref(
  Array(30)
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
  <div class="flex flex-col gap-5">
    <PageTitle text="Problem List" />
    <SearchBar placeholder="keywords" class="self-end" />
    <n-data-table
      :columns="columns"
      :data="data.slice((currentPage - 1) * 5, currentPage * 5)"
      :loading="loading"
      :scroll-x="1100"
      :bordered="false"
      class="mb-5 text-xl"
      row-class-name="text-base"
    />
    <Pagination v-model="currentPage" :number-of-pages="6" class="self-end" />
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
