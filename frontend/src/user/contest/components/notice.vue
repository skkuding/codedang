<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

const fields = [
  { key: 'id', label: '#' },
  { key: 'time', label: 'Time' },
  { key: 'description', label: 'Description' }
]

const noticeList = [
  {
    id: 'A',
    time: '2021-12-27 18:22:05',
    description: '문제 A번에 들어간 사진이 잘못 되어 수정하였습니다.'
  },
  {
    id: 'C',
    time: '2021-12-27 18:22:05',
    description: '문제 C번의 설명을 수정하였습니다.'
  }
]
</script>

<template>
  <PaginationTable
    :number-of-pages="1"
    :fields="fields"
    :items="noticeList"
    no-search-bar
  />
</template>
