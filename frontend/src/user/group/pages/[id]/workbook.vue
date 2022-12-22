<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import { ref } from 'vue'

defineProps<{
  id: number
}>()

const texts = ['Latest', 'Ongoing']
const selected = ref()
const setSelected = (index: number) => {
  selected.value = index
}

const cardItems = [
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.03.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 4
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 5
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  }
]
</script>

<template>
  <div>
    <div class="mb-16 flex justify-end">
      <RadioButton class="mr-8" :texts="texts" @selected="setSelected" />
      <SearchBar placeholder="keywords" />
    </div>
    <div class="grid grid-cols-2">
      <ProgressCard
        v-for="(item, index) in cardItems"
        :key="index"
        :title="item.title"
        :header="item.header"
        :description="item.description"
        :total="item.total"
        :complete="item.complete"
        class="m-4 cursor-pointer"
        @click="clickCard(index)"
      />
    </div>
  </div>
</template>
