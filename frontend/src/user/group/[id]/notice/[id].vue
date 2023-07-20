<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { onMounted } from 'vue'
import { ref, markRaw, type Component } from 'vue'
import { useRouter } from 'vue-router'
import IconAngleDown from '~icons/fa6-solid/angle-down'
import IconAngleUp from '~icons/fa6-solid/angle-up'
import IconBars from '~icons/fa6-solid/bars'

const props = defineProps<{
  id: string
}>()

interface Field {
  key: string
  width?: string
  label?: string
}

interface Item {
  icon?: Component
  name?: 'prev' | 'next'
  id: number
  title: string
  createTime?: string
  updateTime?: string
  content?: string
}

const useNotice = () => {
  const notices = ref<Item[]>([])
  async function getNoticeList(numberOfPages: number) {
    const res = await axios.get('/api/notice', {
      params:
        numberOfPages == 1
          ? { take: 10 }
          : { take: 10, cursor: 10 * (numberOfPages - 1) }
    })
    notices.value = res.data
    notices.value.map((notice) => {
      notice.createTime = useDateFormat(notice.createTime, 'YYYY-MM-DD').value
    })
  }
  // TODO: number of pages api로 받아오기
  const numberOfPages = 2
  const currentNotice = ref<Item>()
  const previousNotice = ref<Item>()
  const nextNotice = ref<Item>()
  const adjacentNotices = ref<Item[]>([])

  const router = useRouter()

  const goDetail = async ({ id }: Item) => {
    await router.push({
      name: 'notice-id',
      params: { id }
    })
  }

  async function getNotice(id: number) {
    const res = await axios.get('/api/group/1/notice/2' + id)

    res.data.current.createTime = useDateFormat(
      res.data.current.createTime,
      'YYYY-MM-DD'
    ).value
    res.data.current.updateTime = useDateFormat(
      res.data.current.updateTime,
      'YYYY-MM-DD'
    ).value
    currentNotice.value = res.data.current
    previousNotice.value = res.data.prev
    nextNotice.value = res.data.next
    adjacentNotices.value = []

    if (previousNotice.value) {
      previousNotice.value.icon = markRaw(IconAngleUp)
      previousNotice.value.name = 'prev'
      adjacentNotices.value.push(markRaw(previousNotice.value))
    }
    if (nextNotice.value) {
      nextNotice.value.icon = markRaw(IconAngleDown)
      nextNotice.value.name = 'next'
      adjacentNotices.value.push(markRaw(nextNotice.value))
    }
  }

  return {
    notices,
    numberOfPages,
    currentNotice,
    adjacentNotices,
    getNoticeList,
    goDetail,
    getNotice
  }
}
const router = useRouter()

const { currentNotice, adjacentNotices, numberOfPages, getNotice, goDetail } =
  useNotice()

onMounted(async () => {
  try {
    await getNotice(parseInt(props.id))
  } catch (err) {
    router.replace('/404')
  }
})

const changePage = async (item: Item) => {
  await goDetail(item)
  getNotice(parseInt(props.id))
  if (!currentNotice.value) {
    await router.replace({ name: 'all' })
  }
}

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
        <div class="ml-2 hidden sm:block">List</div>
      </router-link>
    </div>
    <div
      class="bg-gray-light border-gray flex w-full justify-between border-y p-4"
    >
      <PageSubtitle
        :text="currentNotice?.title || ''"
        class="!text-text-title break-all"
      />
      <div class="hidden min-w-fit items-center pl-4 md:flex">
        {{ currentNotice?.createTime }}
      </div>
    </div>
    <div class="m-4 hidden text-right text-sm md:block">
      Last update: {{ currentNotice?.updateTime }}
    </div>
    <div
      v-dompurify-html="currentNotice?.content"
      class="prose min-h-[400px] w-full max-w-full break-all p-4"
    ></div>
    <PaginationTable
      no-header
      no-pagination
      no-search-bar
      :number-of-pages="numberOfPages"
      :fields="field"
      :items="adjacentNotices"
      @row-clicked="changePage"
    >
      <template #icon="{ row }">
        <component :is="row.icon" />
      </template>
    </PaginationTable>
  </div>
</template>
