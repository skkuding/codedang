<script setup lang="ts">
import PaginationTable from './PaginationTable.vue'
</script>

<template>
  <Story>
    <PaginationTable
      :fields="[{ key: 'title' }, { key: 'date' }]"
      :items="[
        { title: 'Lorem Ipsum is simply dummy text', date: '2022-01-01' }
      ]"
      :per-page="4"
      placeholder="keywords"
      text="No data"
      :number-of-pages="5"
    >
      <template #title="data">
        {{ data.row.title }}
      </template>
      <template #date="data">
        {{ data.row.date }}
      </template>
    </PaginationTable>
  </Story>
</template>
