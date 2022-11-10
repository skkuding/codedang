<script setup lang="ts">
import Card from '@/common/components/Molecule/Card.vue'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconMedal from '~icons/fa6-solid/medal'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconCalendar from '~icons/fa6-solid/calendar'

const noticeItems = [
  {
    title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
    date: 'Jan 9,2021',
    href: '/'
  },
  {
    title: 'SKKU Coding Platform 모의대회 결과',
    date: 'Dec 31,2020',
    href: '/'
  }
]

const contestItems = [
  {
    title: 'SKKU Coding Platform 모의대회',
    date: 'Jan 9,2021',
    href: '/',
    state: 'ongoing'
  },
  {
    title: 'SKKU Coding Platform 1차 대회',
    date: 'Dec 31,2020',
    href: '/',
    state: 'prearranged'
  },
  {
    title: 'SKKU Coding Platform 2차 대회',
    date: 'Dec 31,2020',
    href: '/',
    state: 'prearranged'
  }
]
</script>

<template>
  <div
    class="my-20 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-start"
  >
    <Card href="/notice" :items="noticeItems" class="w-[36rem] max-w-full">
      <template #title>
        <IconInfo />
        <h2 class="ml-2">Notice</h2>
      </template>

      <template #icon>
        <IconAngleRight />
      </template>
    </Card>
    <Card href="/contest" :items="contestItems" class="w-[36rem] max-w-full">
      <template #title>
        <IconMedal />
        <h2 class="ml-2">Current/Upcoming Contests</h2>
      </template>

      <template #icon="item">
        <IconEllipsis v-if="item.item === 'ongoing'" />
        <IconCalendar v-else />
      </template>
    </Card>
  </div>
</template>

<route lang="yaml">
meta:
  home: true
</route>
