<script setup lang="ts">
import dummyImg from '@/common/assets/dummy.png'
import GithubLogo from '@/common/assets/github.svg'
import SkkudingLogo from '@/common/assets/skkudingLogo.png'
import NewCard from '@/common/components/Molecule/NewCard.vue'
import type { Contest } from '@/user/contest/pages/index.vue'
import Carousel from '@/user/home/components/Carousel.vue'
import type { NoticeItem } from '@/user/notice/composables/notice'
import { useDateFormat } from '@vueuse/core'
import axios from 'axios'
import { ref } from 'vue'
import ContestItem from '../components/ContestItem.vue'

interface Post {
  title: string
  href: string
  date: string
}

interface ContestPost {
  title: string
  href: string
  state: string
  startTime: string
  endTime: string
}

const notices = ref<Post[]>([])
const contest = ref<ContestPost[]>([])

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
      startTime: element.startTime,
      endTime: element.endTime,
      href: `/contest/${element.id}`,
      state: 'ongoing'
    })
  })
  res.data.upcoming.map((element: Contest) => {
    contest.value.push({
      title: element.title,
      startTime: element.startTime,
      endTime: element.endTime,
      href: `/contest/${element.id}`,
      state: 'upcoming'
    })
  })
})
</script>

<template>
  <Carousel
    v-if="$router.currentRoute.value.meta.home"
    :slides="[
      {
        topTitle: 'Codedang,',
        bottomTitle: 'Online Judge for SKKU',
        sub: 'Level up your coding skills with us',
        img: dummyImg,
        imgAlt: 'Codedang Intro Banner',
        color: 'blue'
      },
      {
        topTitle: 'SKKUDING',
        bottomTitle: 'Beta Service',
        sub: `Feel free to contact us if there's any bug`,
        img: SkkudingLogo,
        imgAlt: 'SKKUDING Beta service Banner',
        color: 'black'
      },
      {
        topTitle: 'Contribute to',
        bottomTitle: 'Codedang on GitHub',
        sub: 'Our project is open source!',
        img: GithubLogo,
        imgAlt: 'Github Link Banner',
        color: 'yellow',
        href: 'https://github.com/skkuding/codedang'
      }
    ]"
  />
  <div
    class="mt-8 flex flex-wrap items-start justify-between gap-5 md:flex-nowrap"
  >
    <NewCard title="notices">
      <div
        v-for="(item, index) in notices"
        :key="index"
        class="g border-b border-slate-50 py-5 last:border-none last:pb-0"
      >
        <RouterLink :to="item.href">
          {{ item.title }}
        </RouterLink>
        <p class="text-gray mt-1 text-sm">
          {{ item.date }}
        </p>
      </div>
    </NewCard>
    <NewCard title="contests">
      <ContestItem
        v-for="(item, index) in contest"
        :key="index"
        :title="item.title"
        :start-time="item.startTime"
        :end-time="item.endTime"
        :state="item.state"
        :href="item.href"
      />
    </NewCard>
  </div>
</template>

<route lang="yaml">
meta:
  home: true
</route>
