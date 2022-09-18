<script setup lang="ts">
import Header from '@/common/components/Organism/Header.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import FaSolidBars from '~icons/fa-solid/bars'
import Fa6SolidAngleUp from '~icons/fa6-solid/angle-up'
import Fa6SolidAngleDown from '~icons/fa6-solid/angle-down'
import { useRouter } from 'vue-router'
import { onBeforeUpdate } from 'vue'

const props = defineProps<{
  id: string
}>()
interface field {
  key: string
  label?: string
  custom?: boolean
}
interface item {
  [key: string]: any
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
const goDetail = (item: any) => {
  router.push({
    name: 'notice-id',
    params: { id: item.id }
  })
}
let show = true
const numberOfPages = 1
const paginationField: field[] = [
  { key: 'icon' },
  { key: 'name' },
  { key: 'title' }
]
let paginationItem: item[] = []
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
  <Header></Header>
  <div class="mx-auto mt-10 w-[70%]">
    <div class="flex items-center justify-end">
      <router-link to="/notice">
        <FaSolidBars />
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
