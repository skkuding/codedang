<script setup lang="ts">
import PaginationTable from '@/client/src/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/client/src/common/components/Atom/PageTitle.vue'
import { useNotice, type Field } from '../composables/notice'

const field: Field[] = [
  { key: 'title', width: '70%' },
  { key: 'createTime', label: 'Date' }
]
const { notices, numberOfPages, getNoticeList, goDetail } = useNotice()

getNoticeList(1)
// TODO: 페이지네이션, 검색 기능 추가
</script>

<template>
  <div class="mt-10">
    <PageTitle text="Notice" />
    <PaginationTable
      :fields="field"
      :items="notices"
      text="No Notice"
      :number-of-pages="numberOfPages"
      @row-clicked="goDetail"
      @change-page="getNoticeList"
    />
  </div>
</template>
