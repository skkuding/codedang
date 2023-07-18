<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'

// import { useListAPI } from '@/common/composables/api'

defineProps<{
  id: number
}>()

const fields = [{ key: 'problemId', label: '#' }, { key: 'title' }]

interface Problem {
  id: string
  problemId: string
  title: string
}

// remove after connection problem list api
const items1: Problem[] = [...Array(10).keys()].map((i) => {
  return {
    id: i + '',
    problemId: i * 10 + '',
    title: 'NPC 코딩 대회 제 ' + i + '회'
  }
})

const filter = () => {
  // TODO: connect api
}

//const { items, totalPages, changePage } = useListAPI<Problem>('')
const [totalPages, changePage] = [
  3,
  () => {
    console.log('dummy')
  }
]
</script>

<template>
  <div>
    <PaginationTable
      :fields="fields"
      :items="items1"
      placeholder="keywords"
      :number-of-pages="totalPages"
      @search="filter"
      @change-page="changePage"
      @row-clicked="({ id }) => $router.push('/problem/' + id)"
    />
  </div>
</template>
