<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import IconBars from '~icons/fa6-solid/bars'
import { useNotice, type Field, type NoticeItem } from '../composables/notice'

const props = defineProps<{
  id: string
}>()

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

const changePage = async (item: NoticeItem) => {
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
      <RouterLink to="/notice" class="flex items-center">
        <IconBars />
        <div class="ml-2 hidden sm:block">List</div>
      </RouterLink>
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
    <div class="flex justify-between">
      <div
        class="!text-text-title m-4 hidden break-all text-sm font-bold md:block"
      >
        {{ currentNotice?.createdBy }}
      </div>
      <div class="m-4 hidden text-right text-sm md:block">
        Last update: {{ currentNotice?.updateTime }}
      </div>
    </div>
    <div
      v-dompurify-html="currentNotice?.content"
      class="prose min-h-[400px] w-full max-w-full break-all p-4"
    />
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
