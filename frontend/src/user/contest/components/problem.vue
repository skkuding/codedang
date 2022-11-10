<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

const fields = [
  { key: 'id', label: '#' },
  { key: 'title', label: 'Title' }
]

const problemList = [
  { id: 'A', title: '가파른 경사' },
  { id: 'B', title: '가파른 경사' },
  { id: 'C', title: '가파른 경사' },
  { id: 'D', title: '가파른 경사' }
]
</script>

<template>
  <PaginationTable
    :number-of-pages="1"
    :fields="fields"
    :items="problemList"
    no-search-bar
  />
</template>
