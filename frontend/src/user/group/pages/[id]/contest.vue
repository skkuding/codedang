<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
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
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    header: '2022.05.07 updated',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    header: '2022.05.07 updated',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  },
  {
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
    title: 'SKKU 프로그래밍 대회 2023',
    description: 'description',
    coloredTextShort: 'Started Before 00:07:05'
  }
]
</script>

<template>
  <div>
    <div
      class="mb-16 flex flex-col items-end justify-end lg:flex-row lg:justify-end"
    >
      <RadioButton
        class="mb-2 lg:mb-0 lg:mr-8"
        :texts="texts"
        @selected="setSelected"
      />
      <SearchBar placeholder="keywords" />
    </div>
    <div class="flex flex-col justify-center gap-4">
      <CardItem
        v-for="(item, index) in cardItems"
        :key="index"
        :img="item.img"
        :title="item.title"
        :description="item.description"
        :colored-text="item.coloredTextShort"
        border-color="gray"
        class="w-full drop-shadow-md"
      />
    </div>
  </div>
</template>
