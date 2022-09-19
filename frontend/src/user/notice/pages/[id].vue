<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import Fa6SolidBars from '~icons/fa6-solid/bars'
import Fa6SolidAngleUp from '~icons/fa6-solid/angle-up'
import Fa6SolidAngleDown from '~icons/fa6-solid/angle-down'
import { useRouter } from 'vue-router'
import { onBeforeUpdate, type Component } from 'vue'

const props = defineProps<{
  id: string
}>()
interface Field {
  key: string
  label?: string
  custom?: boolean
}
// use type alias instead of interface
// https://github.com/microsoft/TypeScript/issues/15300
type Item = {
  icon: Component
  title: string
  name: string
  id: string
}
const router = useRouter()
let noticeItem = {
  title: '1111',
  date: '2022-04-01',
  content: 'this is notice',
  update: '2022-04-11',
  id: props.id
}
onBeforeUpdate(() => (noticeItem.id = router.currentRoute.value.params.id[0]))
const preNotice = {
  title: '0000',
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
let show = true
const numberOfPages = 1
const paginationField: Field[] = [
  { key: 'icon' },
  { key: 'name' },
  { key: 'title' }
]
let paginationItem: Item[] = []
if (preNotice.id) {
  paginationItem.push({
    icon: Fa6SolidAngleUp,
    name: 'Previous',
    title: preNotice.title,
    id: preNotice.id
  })
}
if (nextNotice.id) {
  paginationItem.push({
    icon: Fa6SolidAngleDown,
    name: 'Next',
    title: nextNotice.title,
    id: nextNotice.id
  })
}
</script>

<template>
  <div class="mx-auto mt-10 w-[70%]">
    <div class="flex items-center justify-end">
      <router-link to="/notice">
        <Fa6SolidBars />
      </router-link>
      <router-link to="/notice" class="ml-2 hidden sm:block">List</router-link>
    </div>
    <div
      class="bg-gray-light border-gray mt-4 flex h-12 w-full items-center border-y-[1px]"
    >
      <div class="ml-4 mr-auto">
        {{ noticeItem.title }}
      </div>
      <div class="mr-4 hidden text-right sm:block">
        {{ noticeItem.date }}
      </div>
    </div>
    <div class="mt-2 hidden w-full justify-end pr-4 text-right md:block">
      Last update: {{ noticeItem.update }}
    </div>
    <div class="my-4 h-min min-h-[400px] w-full max-w-full break-all px-4">
      {{ noticeItem.content }}
    </div>
    <PaginationTable
      :no-header="show"
      :no-pagination="show"
      :no-search-bar="show"
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
