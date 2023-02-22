<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
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
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: true
  },
  {
    id: 2,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    id: 3,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    id: 4,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: true
  },
  {
    id: 5,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    id: 6,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    id: 7,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    id: 8,
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
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
  <div class="flex flex-col justify-center gap-4">
    <CardItem
      v-for="{
        id: contestId,
        img,
        title,
        description,
        participation,
        startedBefore
      } in data"
      :key="contestId"
      :img="img"
      :title="title"
      :description="description"
      :additional-text="participation ? '#참여' : ''"
      :colored-text="`Started Before ${startedBefore}`"
      :border-color="participation ? 'green' : 'gray'"
      class="w-full bg-white drop-shadow-md"
      @click="$router.push(`/contest/${contestId}`)"
    />
  </div>
</template>
