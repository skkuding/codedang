<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { NTag, NButton, NIcon, NDataTable, NCard } from 'naive-ui'
import { h, ref } from 'vue'
import Fa6RegularSquareCaretRight from '~icons/fa6-regular/square-caret-right'
import Fa6RegularTrashCan from '~icons/fa6-regular/trash-can'

interface Pool {
  id: number
  name: string
  problems: string
  createTime: string
  sharedGroup: string[]
}

const deletePool = (row: Pool) => {
  console.log('delete Pool', row)
}

const columns = [
  {
    title: '#',
    key: 'id',
    minWidth: 80
  },
  {
    title: 'Name',
    key: 'name',
    minWidth: 250
  },
  {
    title: 'Problems',
    key: 'problems',
    align: 'center' as const,
    width: 150
  },
  {
    title: 'Create Time',
    key: 'createTime',
    width: 220
  },
  {
    title: 'Shared Group',
    key: 'sharedGroup',
    align: 'center' as const,
    width: 300,
    render(row: Pool) {
      const tags = row.sharedGroup.map((tagKey) => {
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
    title: 'Delete',
    key: 'delete',
    align: 'center' as const,
    width: 150,
    render(row: Pool) {
      return [
        h(NButton, {
          style: {
            marginRight: '6px'
          },
          strong: true,
          size: 'small',
          bordered: true,
          onClick: () => deletePool(row),
          renderIcon() {
            return h(NIcon, null, {
              default: () => h(Fa6RegularTrashCan)
            })
          }
        }),
        h(NButton, {
          style: {
            marginRight: '6px'
          },
          strong: true,
          size: 'small',
          bordered: true,
          onClick: () => deletePool(row),
          renderIcon() {
            return h(NIcon, null, {
              default: () => h(Fa6RegularSquareCaretRight)
            })
          }
        })
      ]
    }
  }
]
const loading = ref(false)
const data = ref(
  Array(104)
    .fill({
      id: 1,
      name: '가파른 경사',
      problems: '20',
      createTime: '2022-08-28 18:00:00',
      sharedGroup: ['NPC 초급반', 'NPC 중급반', 'NPC 고급반']
    })
    .map((item, index) => ({
      ...item,
      id: item.id + index,
      problems: (item.id + index) * 6
    }))
)
</script>

<template>
  <div class="flex flex-col">
    <PageTitle text="Problem Pool List" class="mb-5" />
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
      row-class-name="text-base"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
