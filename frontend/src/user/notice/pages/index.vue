<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
import { useRouter } from 'vue-router'
import type { Field, NoticeItem } from '../composables/notice'

const field: Field[] = [
  { key: 'title', width: '70%' },
  { key: 'createdBy', label: 'CreatedBy' },
  { key: 'createTime', label: 'Date' }
]

const { items, totalPages, changePage } = useListAPI<NoticeItem>('notice', 4)
//TODO: 백엔드에서 createdBy를 포함해서 보내줘야함.
const router = useRouter()

const goDetail = ({ id }: NoticeItem) => {
  router.push({ name: 'notice-id', params: { id } })
}

// // TODO: 검색 기능 추가
</script>

<template>
  <div class="mt-10">
    <PageTitle text="Notice" />
    <PaginationTable
      :fields="field"
      :items="items"
      text="No Notice"
      :number-of-pages="totalPages"
      @row-clicked="goDetail"
      @change-page="changePage"
    />
  </div>
</template>
