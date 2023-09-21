<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useListAPI } from '@/common/composables/api'
import { computed, ref } from 'vue'

const props = defineProps<{
  id: number
}>()

const fields = [
  { key: 'title', label: 'Title', width: '80%' },
  { key: 'createTime' }
]

interface Notice {
  id: number
  title: string
  createTime: string
  isFixed: boolean
}

const { items, totalPages, changePage } = useListAPI<Notice>(
  computed(() => `group/${props.id}/notice`)
)

const filter = () => {
  // TODO: 추후 api 연결
}

// show title when click the row
const selected = ref('')

const clickRow = ({ title }: Notice) => {
  selected.value = title
}
</script>

<template>
  <div>
    <PaginationTable
      :fields="fields"
      :items="items"
      placeholder="keywords"
      :number-of-pages="totalPages"
      @search="filter"
      @change-page="changePage"
      @row-clicked="clickRow"
    />
  </div>
</template>
