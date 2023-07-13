<script setup lang="ts">
import Card from '@/common/components/Molecule/Card.vue'
import type { Contest } from '@/user/contest/pages/index.vue'
import type { NoticeItem } from '@/user/notice/composables/notice'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { ref } from 'vue'
import IconAngleRight from '~icons/fa6-solid/angle-right'
import IconBars from '~icons/fa6-solid/bars'
import IconCalendar from '~icons/fa6-solid/calendar'
import IconInfo from '~icons/fa6-solid/circle-info'
import IconEllipsis from '~icons/fa6-solid/ellipsis'
import IconMedal from '~icons/fa6-solid/medal'

interface Post {
  title: string
  date: string
  href: string
  state?: string
}

const notices = ref<Post[]>([])
const contest = ref<Post[]>([])

axios
  .get('/api/notice', {
    params: { take: 3 }
  })
  .then((res) => {
    notices.value = res.data.map((element: NoticeItem) => ({
      title: element.title,
      date: useDateFormat(element.createTime, 'YYYY-MM-DD').value,
      href: `/notice/${element.id}`
    }))
  })

axios.get('api/contest').then((res) => {
  res.data.ongoing.map((element: Contest) => {
    contest.value.push({
      title: element.title,
      date: useDateFormat(element.startTime, 'YYYY-MM-DD').value,
      href: `/contest/${element.id}`,
      state: 'ongoing'
    })
  })
  res.data.upcoming.map((element: Contest) => {
    contest.value.push({
      title: element.title,
      date: useDateFormat(element.startTime, 'YYYY-MM-DD').value,
      href: `/contest/${element.id}`,
      state: 'upcoming'
    })
  })
})
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
