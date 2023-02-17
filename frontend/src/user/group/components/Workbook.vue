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

const cardItems = [
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.03.07 updated',
    description: 'description',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 3
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 4
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',

    total: 6,
    complete: 5
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
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
      v-for="(item, index) in cardItems"
      :key="index"
      :title="item.title"
      :header="item.header"
      :description="item.description"
      :total="item.total"
      :complete="item.complete"
      class="cursor-pointer"
      progress-text="problems"
      color="#CDCDCD"
      @click="$router.push('/workbook/' + index)"
    />
  </div>
</template>
