<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import { useNotice, type Field } from '../composables/notice'

const field: Field[] = [{ key: 'title', width: '70%' }, { key: 'date' }]
const { notices, goDetail } = useNotice()

// TODO: 페이지네이션, 검색 기능 추가
</script>

<template>
  <div class="mt-10">
    <PageTitle text="Notice" />
    <PaginationTable
      :fields="field"
      :items="notices"
      text="No Notice"
      :number-of-pages="1"
      @row-clicked="goDetail"
    />
  </div>
</template>
