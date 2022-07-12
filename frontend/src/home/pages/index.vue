<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

const fieldList = [
  {
    key: 'title'
  },
  {
    key: 'date'
  }
]

const item = [
  {
    title: 'SKKU Coding Platform ',
    date: '2021-12-31'
  },
  {
    title: 'SKKU Coding 2차모의대회',
    date: '2021-12-31'
  }
]
</script>

<template>
  <div>This is Main page</div>
  <MyComponent msg="Main!" />

  <PaginationTable
    :fields="fieldList"
    :items="item"
    :per-page="4"
    :current-page="1"
    text="hello"
    hover
  >
    <template #title="data">
      {{ data.row.title }}
    </template>
    <template #date="data">
      {{ data.row.date }}
    </template>
  </PaginationTable>
</template>
