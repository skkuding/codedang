<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import { ref } from 'vue'

defineProps<{
  id: number
}>()

const status = ['Latest', 'Ongoing']
const selected = ref()
const changeSelected = (index: number) => {
  selected.value = index
}

interface Item {
  img: string
  title: string
  description: string
  startedBefore: string
  participation: boolean
}

const cardItems: Item[] = [
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: true
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: true
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    startedBefore: '00:07:05',
    participation: false
  }
]
</script>

<template>
  <div>
    <div
      class="mb-8 flex flex-col items-end justify-end gap-y-2 gap-x-4 lg:flex-row"
    >
      <RadioButton :texts="status" @selected="changeSelected" />
      <SearchBar placeholder="keywords" />
    </div>
    <div class="flex flex-col justify-center gap-4">
      <CardItem
        v-for="(
          { img, title, description, participation, startedBefore }, index
        ) in cardItems"
        :key="index"
        :img="img"
        :title="title"
        :description="description"
        :additional-text="participation ? '#참여' : ''"
        :colored-text="`Started Before ${startedBefore}`"
        :border-color="participation ? 'green' : 'gray'"
        class="w-full bg-white drop-shadow-md"
      />
    </div>
  </div>
</template>
