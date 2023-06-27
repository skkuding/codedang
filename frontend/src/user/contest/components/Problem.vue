<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import axios from 'axios'
import { ref } from 'vue'

const props = defineProps<{
  id: number
}>()

interface Problem {
  id: string
  problemId: number
  title: string
}
const field = [{ key: 'id', label: '#', width: '40%' }, { key: 'title' }]
const problemList = ref<Problem[]>([])

axios
  .get(`/api/contest/${props.id}/problem`, {
    params: {
      take: 10
    }
  })
  .then((res) => {
    problemList.value = res.data
  })
</script>

<template>
  <PaginationTable
    :fields="field"
    :items="problemList"
    no-search-bar
    :number-of-pages="1"
    @row-clicked="({ id }) => $router.push('/problem/' + id)"
  />
</template>
