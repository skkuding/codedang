<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import { useAuthStore } from '@/common/store/auth'
import { useIntersectionObserver } from '@vueuse/core'
import { ref, watchEffect } from 'vue'
import axios from 'axios'

const props = defineProps<{
  id: number
}>()

const filters = ['Latest', 'Ongoing']
const selectedFilter = ref(filters[0])

// server data
type Response = {
  id: number
  title: string
  description: string
  updateTime: string
}[]
const workbookList = ref<Response>([])

// query parameters
const take = ref(10)
const cursor = ref(0)
const hasNextPage = ref(true)
const loading = ref(false)
const store = useAuthStore()

// call group workbook list get api
watchEffect(async () => {
  // 임시 코드 (header에서 로그인 안됨)
  if (!store.isLoggedIn) {
    await store.login('user10', 'Useruser')
    return
  }

  if (!hasNextPage.value) return
  const url = cursor.value
    ? `/api/group/${props.id}/workbook?take=${take.value}&cursor=${cursor.value}`
    : `/api/group/${props.id}/workbook?take=${take.value}`
  try {
    loading.value = true
    const { data } = await axios.get<Response>(url)
    workbookList.value.push(...data)
    loading.value = false
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
    class="mb-8 flex flex-col items-end justify-end gap-y-2 gap-x-4 lg:flex-row"
  >
    <RadioButton v-model="selectedFilter" :texts="filters" />
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
    <div v-if="!loading" ref="target" />
  </div>
</template>
