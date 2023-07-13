<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'

const props = defineProps<{
  id: number
}>()

interface Problem {
  id: string
  problemId: number
  title: string
}
const field = [{ key: 'id', label: '#', width: '40%' }, { key: 'title' }]

const { items, totalPages } = useListAPI<Problem>(`contest/${props.id}/problem`)
</script>

<template>
  <PaginationTable
    :fields="field"
    :items="items"
    no-search-bar
    :number-of-pages="totalPages"
    @row-clicked="({ id }) => $router.push('/problem/' + id)"
  />
</template>
