<script setup lang="ts">
import Footer from '@/common/components/Organism/Footer.vue'
import Header from '@/common/components/Organism/Header.vue'
import Card from '../components/Card.vue'

import Carousel from '../components/Carousel.vue'

import IconInfo from '~icons/fa6-solid/circle-info'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconMedal from '~icons/fa6-solid/medal'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconCalendar from '~icons/fa6-solid/calendar'

const noticeItems = [
  {
    title: 'SKKU Coding Platform 모의대회 결과 및 솔루션',
    date: 'Jan 9,2021',
    href: '#'
  },
  {
    title: 'SKKU Coding Platform 모의대회 결과',
    date: 'Dec 31,2020',
    href: '#'
  }
]

const contestItems = [
  {
    title: 'SKKU Coding Platform 모의대회',
    date: 'Jan 9,2021',
    href: '#',
    state: 'ongoing'
  },
  {
    title: 'SKKU Coding Platform 1차 대회',
    date: 'Dec 31,2020',
    href: '#',
    state: 'prearranged'
  },
  {
    title: 'SKKU Coding Platform 2차 대회',
    date: 'Dec 31,2020',
    href: '#',
    state: 'prearranged'
  }
]
const slides = [
  'https://picsum.photos/id/1032/900/400',
  'https://picsum.photos/id/1033/900/400',
  'https://picsum.photos/id/1037/900/400',
  'https://picsum.photos/id/1035/900/400',
  'https://picsum.photos/id/1036/900/400'
]
</script>

<template>
  <Header class="fixed top-0 z-40 w-full"></Header>
  <body class="h-screen">
    <Carousel :slides="slides" class="z-10 mt-[56px]"></Carousel>
    <div class="inline-flex-col relative z-10 mt-1 lg:flex">
      <Card href="#" :items="noticeItems" class="mx-auto w-5/12">
        <template #title>
          <IconInfo />
          <h2 class="ml-2">Notice</h2>
        </template>

        <template #icon>
          <IconAngleRight />
        </template>
      </Card>
      <Card href="#" :items="contestItems" class="mx-auto w-5/12">
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
  </body>
  <Footer class="fixed bottom-0 z-30" />
</template>
