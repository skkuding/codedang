<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import IconBars from '~icons/fa6-solid/bars'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotice, type Field } from '../composables/notice'

const props = defineProps<{
  id: string
}>()

const router = useRouter()

const { currentNotice, adjacentNotices, numberOfPages, getNotice, goDetail } =
  useNotice()

onMounted(() => {
  getNotice(parseInt(props.id))

  if (!currentNotice.value) {
    router.replace('/404')
    return
  }
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
      <PageSubtitle
        :text="currentNotice?.title || ''"
        class="!text-text-title"
      />
      <div class="hidden sm:block">
        {{ currentNotice?.createTime }}
      </div>
    </div>
    <div class="m-4 text-right text-sm">
      Last update: {{ currentNotice?.update }}
    </div>
    <div class="min-h-[400px] w-full max-w-full break-all p-4">
      {{ currentNotice?.content }}
    </div>
    <PaginationTable
      no-header
      no-pagination
      no-search-bar
      :number-of-pages="numberOfPages"
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
