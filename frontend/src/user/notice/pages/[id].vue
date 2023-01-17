<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import IconBars from '~icons/fa6-solid/bars'
import IconAngleUp from '~icons/fa6-solid/angle-up'
import IconAngleDown from '~icons/fa6-solid/angle-down'
import { onMounted, type Ref } from 'vue'
import { useNotice, type Field, type Item } from '../composables/notice'

const props = defineProps<{
  id: string
}>()
const { currentNotice, adjacentNotices, getNotice, goDetail } = useNotice()
const notice = currentNotice as Ref<Item>

onMounted(() => {
  getNotice(parseInt(props.id))
  adjacentNotices.value.map((x: Item) => {
    if (x.id === notice.value.id - 1) {
      x.icon = IconAngleUp
      x.name = 'prev'
    } else {
      x.icon = IconAngleDown
      x.name = 'next'
    }
  })
})

const field: Field[] = [
  { key: 'icon', width: '5%' },
  { key: 'name', width: '20%' },
  { key: 'title' }
]
</script>

<template>
  <div class="mt-10">
    <div class="mb-4 flex justify-end">
      <router-link to="/notice" class="flex items-center">
        <IconBars />
        <div class="ml-2">List</div>
      </router-link>
    </div>
    <div
      class="bg-gray-light border-gray flex w-full justify-between border-y p-4"
    >
      <PageSubtitle :text="notice.title || ''" class="!text-text-title" />
      <div class="hidden sm:block">
        {{ notice.date }}
      </div>
    </div>
    <div class="m-4 text-right text-sm">Last update: {{ notice.update }}</div>
    <div class="min-h-[400px] w-full max-w-full break-all p-4">
      {{ notice.content }}
    </div>
    <PaginationTable
      no-header
      no-pagination
      no-search-bar
      :number-of-pages="1"
      :fields="field"
      :items="adjacentNotices"
      @row-clicked="goDetail"
    >
      <template #icon="{ row }">
        <component :is="row.icon" />
      </template>
    </PaginationTable>
  </div>
</template>
