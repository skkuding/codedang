<script setup lang="ts">
import Card from './Card.vue'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconMedal from '~icons/fa6-solid/medal'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconCalendar from '~icons/fa6-solid/calendar'

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
    <Variant title="Notices">
      <Card :carditemlist="noticeitemlist">
        <template #title>
          <IconInfo />
          <span class="ml-2">Notice</span>
        </template>

        <template #icon>
          <IconAngleRight />
        </template>
      </Card>
    </Variant>

    <Variant title="Contests">
      <Card :carditemlist="contestitemlist">
        <template #title>
          <IconMedal />
          <span class="ml-2">Current/Upcoming Contests</span>
        </template>

        <template #icon="item">
          <a href="#">
            <IconEllipsis v-if="item.item === 'ongoing'" />
            <IconCalendar v-else />
          </a>
        </template>
      </Card>
    </Variant>
  </Story>
</template>
