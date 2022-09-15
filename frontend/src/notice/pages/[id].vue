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
const router = useRouter()
let noticeItem = {
  title: '1111',
  date: '2022-04-01',
  content: 'this is notice',
  update: '2022-04-11',
  id: props.id
}
onBeforeUpdate(
  () =>
    // call api
    (noticeItem.id = router.currentRoute.value.params.id[0])
)
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
const goDetail = (nextId: string) => {
  return '/notice/' + nextId
}
</script>

<template>
  <Header></Header>
  <div :key="router.currentRoute.value.fullPath" class="mx-auto mt-10 w-[70%]">
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
    <div class="w-full">
      <router-link
        v-if="preNotice"
        class="border-gray flex h-12 items-center border-y-[1px]"
        :to="goDetail(preNotice.id)"
      >
        <Fa6SolidAngleUp class="ml-2" />
        <div class="ml-4 hidden w-20 sm:block">Previous</div>
        <div class="ml-2">{{ preNotice.title }}</div>
      </router-link>
      <router-link
        v-if="nextNotice"
        class="border-gray flex h-12 items-center border-b-[1px]"
        :to="goDetail(nextNotice.id)"
      >
        <Fa6SolidAngleDown class="ml-2" />
        <div class="ml-4 hidden w-20 sm:block">Next</div>
        <div class="ml-2">{{ nextNotice.title }}</div>
      </router-link>
    </div>
  </div>
</template>
