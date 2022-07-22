<script setup lang="ts">
import Card from './Card.vue'
import GridiconsNoticeOutline from '~icons/gridicons/notice-outline'
import MaterialSymbolsArrowForwardIosRounded from '~icons/material-symbols/arrow-forward-ios-rounded'
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal'
import Fa6RegularCalendar from '~icons/fa6-regular/calendar'
import FaSolidMedal from '~icons/fa-solid/medal'
</script>

<template>
  <Story>
    <Card
      :noticelist="[
        {
          title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
          date: 'Jan 9,2021'
        },
        {
          title: 'SKKU Coding Platform 모의대회 결과',
          date: 'Dec 31,2020'
        }
      ]"
    >
      <GridiconsNoticeOutline class="text-text-title text-xl" />
      <span class="ml-2">Notice</span>
      <template #notice-icon>
        <a href="#"><MdiDotsHorizontal /></a>
      </template>
    </Card>

    <h1 class="m-4 text-xl">Another Example</h1>

    <Card
      :noticelist="[
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
      ]"
    >
      <FaSolidMedal class="text-text-title text-xl" />
      <span class="ml-2">Current/Upcoming Contests</span>
      <template #contest-icon-ongoing>
        <a href="#"><MdiDotsHorizontal /></a>
      </template>
      <template #contest-icon-prearranged>
        <a href="#"><Fa6RegularCalendar /></a>
      </template>
    </Card>
  </Story>
</template>
