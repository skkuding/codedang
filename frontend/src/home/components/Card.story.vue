<script setup lang="ts">
import Card from './Card.vue'
import GridiconsNoticeOutline from '~icons/gridicons/notice-outline'
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal'
import Fa6RegularCalendar from '~icons/fa6-regular/calendar'
import FaSolidMedal from '~icons/fa-solid/medal'

interface data {
  title: string
  date: string
  state?: string
}

const noticeitemlist: data[] = [
  {
    title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
    date: 'Jan 9,2021'
  },
  {
    title: 'SKKU Coding Platform 모의대회 결과',
    date: 'Dec 31,2020'
  }
]

const contestitemlist: data[] = [
  {
    title: 'SKKU Coding Platform 모의대회',
    date: 'Jan 9,2021',
    state: 'ongoing'
  },
  {
    title: 'SKKU Coding Platform 1차 대회',
    date: 'Dec 31,2020',
    state: 'prearranged'
  },
  {
    title: 'SKKU Coding Platform 2차 대회',
    date: 'Dec 31,2020',
    state: 'prearranged'
  }
]
</script>

<template>
  <Story>
    <Card :carditemlist="noticeitemlist">
      <template #title>
        <GridiconsNoticeOutline class="text-text-title text-xl" />
        <span class="ml-2">Notice</span>
      </template>

      <template #icon>
        <a href="#"><MdiDotsHorizontal /></a>
      </template>
    </Card>

    <h1 class="m-4 text-xl">Another Example</h1>

    <Card :carditemlist="contestitemlist">
      <template #title>
        <FaSolidMedal class="text-text-title text-xl" />
        <span class="ml-2">Current/Upcoming Contests</span>
      </template>

      <template #icon="item">
        <a href="#">
          <MdiDotsHorizontal v-if="item.item === 'ongoing'" />
          <Fa6RegularCalendar v-else />
        </a>
      </template>
    </Card>
  </Story>
</template>
