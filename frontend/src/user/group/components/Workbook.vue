<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import { ref } from 'vue'

defineProps<{
  id: number
}>()

const filters = ['Latest', 'Ongoing']
const selectedFilter = ref(filters[0])

// dummy data
const data = [
  {
    id: 1,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.03.07 updated',
    description: 'description',
    total: 6,
    complete: 1
  },
  {
    id: 2,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 2
  },
  {
    id: 3,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 3
  },
  {
    id: 4,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 4
  },
  {
    id: 5,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 5
  },
  {
    id: 6,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 1
  },
  {
    id: 7,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 2
  },
  {
    id: 8,
    title: 'SKKU 프로그래밍 대회 2021',
    updatedAt: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 3
  }
]
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
      v-for="{
        id: workbookId,
        title,
        updatedAt,
        description,
        total,
        complete
      } in data"
      :key="workbookId"
      :title="title"
      :header="updatedAt"
      :description="description"
      :total="total"
      :complete="complete"
      class="cursor-pointer"
      progress-text="problems"
      color="#CDCDCD"
      @click="$router.push(`/workbook/${workbookId}`)"
    />
  </div>
</template>
