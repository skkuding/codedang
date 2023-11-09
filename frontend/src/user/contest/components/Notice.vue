<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { onMounted, ref } from 'vue'

interface Problem {
  id: number
  problemId: number
}

interface Notice {
  id: number
  problem?: Problem
  content: string
  updateTime: string
}

const props = defineProps<{
  id: number
}>()

const fields = [
  { key: 'id', label: '#' },
  { key: 'updateTime', label: 'Time' },
  { key: 'content', label: 'Description' }
]

const noticeList = ref<Notice[]>([])

onMounted(async () => {
  const { data } = await axios.get<Notice[]>(
    `/api/contest/${props.id}/clarification`
  )
  noticeList.value = data.map((notice) => ({
    id: notice.id,
    updateTime: useDateFormat(notice.updateTime, 'YYYY-MM-DD HH:mm:ss').value,
    content: notice.content
  }))
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
