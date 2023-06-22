<script setup lang="ts">
import { ref } from 'vue'
import Card from '@/common/components/Molecule/Card.vue'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconMedal from '~icons/fa6-solid/medal'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconCalendar from '~icons/fa6-solid/calendar'
import IconBars from '~icons/fa6-solid/bars'
import type { Item } from '@/user/notice/composables/notice'
import axios from 'axios'
import { useDateFormat } from '@vueuse/core'

interface Post {
  title: string
  date: string
  href: string
  state?: string
}

interface ContestItem extends Item {
  startTime: string
}

const notices = ref<Post[]>([])
const contest = ref<Post[]>([])

async function getNotice() {
  const res = await axios('/api/notice?take=3')
  notices.value = res.data.map((element: Item) => ({
    title: element.title,
    date: useDateFormat(element.createTime, 'YYYY-MM-DD'),
    href: `/notice/${element.id}`
  }))
}

async function getContest() {
  const res = await axios('/api/contest')
  let count = 0
  const temp: Post[] = []
  res.data.ongoing.map((element: ContestItem) => {
    if (count === 3) return
    temp.push({
      title: element.title,
      date: element.startTime,
      href: `/contest/${element.id}`,
      state: 'ongoing'
    })
    count++
  })
  count = 0
  res.data.upcoming.map((element: ContestItem) => {
    temp.push({
      title: element.title,
      date: element.startTime,
      href: `/contest/${element.id}`,
      state: 'upcoming'
    })
    count++
  })
  temp.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })
  contest.value = temp.slice(0, 3).map((element: Post) => ({
    ...element,
    date: useDateFormat(element.date, 'YYYY-MM-DD').value
  }))
}
getNotice()
getContest()
</script>

<template>
  <div
    class="mt-20 flex flex-col items-center justify-center gap-12 lg:flex-row lg:items-start"
  >
    <Card href="/notice" :items="notices" class="w-[36rem] max-w-full">
      <template #title>
        <IconInfo />
        <h2 class="ml-2">Notice</h2>
      </template>

      <template #icon>
        <IconAngleRight />
      </template>
    </Card>
    <Card href="/contest" :items="contest" class="w-[36rem] max-w-full">
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
