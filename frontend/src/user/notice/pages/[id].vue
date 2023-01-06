<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import IconBars from '~icons/fa6-solid/bars'
import IconAngleUp from '~icons/fa6-solid/angle-up'
import IconAngleDown from '~icons/fa6-solid/angle-down'
import { useRouter } from 'vue-router'
import { onBeforeUpdate } from 'vue'
import type { Item, Field } from '../composables/notice'
const props = defineProps<{
  id: string
}>()

// use type alias instead of interface
// https://github.com/microsoft/TypeScript/issues/15300

const router = useRouter()
let noticeItem = {
  title: 'SKKUDING 모의대회',
  date: '2022-04-01',
  content: 'this is notice',
  update: '2022-04-11',
  id: props.id
}
onBeforeUpdate(() => (noticeItem.id = router.currentRoute.value.params.id[0]))
const preNotice = {
  title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
  date: '2022-04-012',
  content: 'this is preNotice',
  update: '2022-04-12',
  id: '1'
}
const nextNotice = {
  title: '3333',
  date: '2022-04-03',
  content: 'this is nextNotice',
  update: '2022-04-13',
  id: '3'
}
const goDetail = ({ id }: Item) => {
  router.push({
    name: 'notice-id',
    params: { id }
  })
}
const numberOfPages = 1
const paginationField: Field[] = [
  { key: 'icon', width: '5%' },
  { key: 'name', width: '20%' },
  { key: 'title' }
]
let paginationItem: Item[] = []
if (preNotice.id) {
  paginationItem.push({
    icon: IconAngleUp,
    name: 'Previous',
    title: preNotice.title,
    id: preNotice.id
  })
}
if (nextNotice.id) {
  paginationItem.push({
    icon: IconAngleDown,
    name: 'Next',
    title: nextNotice.title,
    id: nextNotice.id
  })
}
</script>

<template>
  <div class="mt-10">
    <div class="mb-4 flex justify-end">
      <router-link to="/notice" class="flex items-center">
        <IconBars />
        <div class="ml-2 hidden sm:block">List</div>
      </router-link>
    </div>
    <div
      class="bg-gray-light border-gray flex w-full justify-between border-y p-4"
    >
      <PageSubtitle :text="noticeItem.title" class="!text-text-title" />
      <div class="hidden sm:block">
        {{ noticeItem.date }}
      </div>
    </div>
    <div class="mt-2 mr-4 hidden text-right text-sm md:block">
      Last update: {{ noticeItem.update }}
    </div>
    <div class="h-min min-h-[400px] w-full max-w-full break-all p-4">
      {{ noticeItem.content }}
    </div>
    <PaginationTable
      no-header
      no-pagination
      no-search-bar
      :number-of-pages="numberOfPages"
      :fields="paginationField"
      :items="paginationItem"
      @row-clicked="goDetail"
    >
      <template #icon="{ row }">
        <component :is="row.icon" />
      </template>
    </PaginationTable>
  </div>
</template>
