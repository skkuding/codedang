<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'

interface Item {
  id: string
  problemId: number
  title: string
}
const field = [
  { key: 'id', label: '#', width: '40%' },
  { key: 'title', label: 'Title' }
]
const items = ref<Item[]>([])

onMounted(async () => {
  const response = await axios.get('/api/contest/1/problem?offset=0&limit=10')
  items.value = response.data
})
</script>

<template>
  <PaginationTable
    :fields="field"
    :items="items"
    no-search-bar
    :number-of-pages="1"
    @row-clicked="({ id }) => $router.push('/problem/' + id)"
  />
</template>
