<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import type { Component } from 'vue'

const fields = [
  { key: 'id' },
  { key: 'name' },
  { key: 'problems' },
  { key: 'createdtime' },
  { key: 'createdby' },
  { key: 'sharedgroup' },
  { key: 'options' }
]

const optionMapper: { [key: string]: Component } = {
  delete: IconTrashCan,
  share: IconPaperPlane
}

const items = [
  {
    id: 1,
    name: '문제set1',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하설빙',
    sharedgroup: ['skkuding', 'npc'],
    options: ['delete', 'share']
  },
  {
    id: 2,
    name: '문제set2',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하설빙',
    sharedgroup: ['skkuding', 'npc'],
    options: ['delete']
  },
  {
    id: 3,
    name: '문제set3',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하설빙',
    sharedgroup: ['skkuding', 'npc'],
    options: ['delete']
  },
  {
    id: 4,
    name: '문제set4',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하설빙',
    sharedgroup: ['skkuding', 'npc'],
    options: ['delete']
  }
]
</script>

<template>
  <div class="mb-6 flex">
    <PageTitle text="Problem Pool List" />
    <Button class="ml-4">+ Create</Button>
  </div>

  <PaginationTable
    no-search-bar
    :fields="fields"
    :items="items"
    :number-of-pages="1"
    text="No data"
  >
    <template #sharedgroup="{ row }">
      <div class="flex">
        <div
          v-for="(group, index) in row.sharedgroup"
          :key="index"
          class="border-gray mr-2 rounded border p-2"
        >
          {{ group }}
        </div>
      </div>
    </template>

    <template #options="{ row }">
      <Button
        v-for="(option, index) in row.options"
        :key="index"
        class="mr-2"
        outline
        color="gray-dark"
      >
        <component :is="optionMapper[option]" />
      </Button>
    </template>
  </PaginationTable>
</template>

<route lang="yaml">
meta:
  layout: admin
  group: skkuding
</route>
