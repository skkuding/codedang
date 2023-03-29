<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

defineProps<{
  id: number
}>()

const fields = [
  { key: 'id', label: '#' },
  { key: 'user', label: 'User' },
  { key: 'pointA', label: 'A' },
  { key: 'pointB', label: 'B' },
  { key: 'pointC', label: 'C' },
  { key: 'pointD', label: 'D' },
  { key: 'total', label: 'Total' }
]

const rankingList = [
  {
    id: '1',
    user: '2018070707',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '100000'
  },
  {
    id: '2',
    user: '2016000000',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '9900'
  },
  {
    id: '3',
    user: '2018111111',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '9200'
  },
  {
    id: '4',
    user: '2019222222',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '7890'
  },
  {
    id: '5',
    user: '2020454545',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '6550'
  },
  {
    id: '6',
    user: '2021989898',
    pointA: '500',
    pointB: '1000',
    pointC: '1500',
    pointD: '1750',
    total: '4400'
  }
]
</script>

<template>
  <PaginationTable
    :number-of-pages="1"
    :fields="fields"
    :items="rankingList"
    no-search-bar
  />
</template>
