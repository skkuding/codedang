<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { ref } from 'vue'

const props = defineProps<{
  id: number
}>()

const fields = [
  { key: 'id', label: '#' },
  { key: 'time', label: 'Time' },
  { key: 'description', label: 'Description' }
]
const formatter = ref('YYYY-MM-DD HH:mm:ss')

const noticeList = ref([])
axios.get(`/api/contest/${props.id}/clarification`).then((res) => {
  noticeList.value = res.data.map(
    (notice: { id: string; updateTime: string; content: string }) => {
      return {
        id: notice.id,
        time: useDateFormat(notice.updateTime, formatter).value,
        description: notice.content
      }
    }
  )
})
</script>

<template>
  <PaginationTable
    :number-of-pages="1"
    :fields="fields"
    :items="noticeList"
    no-search-bar
  />
</template>
