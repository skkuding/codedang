<script setup lang="ts">
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { useAuthStore } from '@/common/store/auth'
import { useIntersectionObserver } from '@vueuse/core'
import axios from 'axios'
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  id: number
}>()

// server data
type Response = {
  id: number
  title: string
  description: string
  updateTime: string
}[]
const workbookList = ref<Response>([])

// query parameters
const take = ref(4)
const cursor = ref(0)
const hasNextPage = ref(true)

// call group workbook list get api
const store = useAuthStore()
watchEffect(async () => {
  if (!store.isLoggedIn) return // 비로그인시 어떤 로직 수행???
  if (!hasNextPage.value) return
  const url = cursor.value
    ? `/api/group/${props.id}/workbook?take=${take.value}&cursor=${cursor.value}`
    : `/api/group/${props.id}/workbook?take=${take.value}`
  try {
    const { data } = await axios.get<Response>(url)
    workbookList.value.push(...data)
    if (data.length < take.value) {
      hasNextPage.value = false
    }
  } catch (e) {
    console.log(e)
  }
})
// infinite scroll
const target = ref(null)
useIntersectionObserver(target, ([{ isIntersecting }]) => {
  if (isIntersecting && workbookList.value.length > 0) {
    cursor.value = workbookList.value[workbookList.value.length - 1].id
  }
})
</script>

<template>
  <div
    class="mb-8 flex flex-col items-end justify-end gap-x-4 gap-y-2 lg:flex-row"
  >
    <SearchBar placeholder="keywords" />
  </div>
  <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
    <ProgressCard
      v-for="{ id: workbookId, title, updateTime, description } in workbookList"
      :key="workbookId"
      :title="title"
      :header="`${updateTime.split('T')[0]} updated`"
      :description="description"
      class="cursor-pointer"
      progress-text="problems"
      color="#CDCDCD"
      :total="6"
      :complete="2"
      @click="$router.push(`/workbook/${workbookId}`)"
    />
  </div>
  <div ref="target" />
</template>
