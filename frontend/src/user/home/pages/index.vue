<script setup lang="ts">
import Card from '@/common/components/Molecule/Card.vue'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconBars from '~icons/fa6-solid/bars'
import IconCalendar from '~icons/fa6-solid/calendar'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconMedal from '~icons/fa6-solid/medal'

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
    class="flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-start"
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
      <template #titleIcon>
        <router-link
          to="/"
          class="cursor-pointer hover:opacity-50 active:opacity-30"
        >
          <IconBars />
        </router-link>
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
