<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import IconAnglesRight from '~icons/fa6-solid/angles-right'
import IconCaretDown from '~icons/fa6-solid/caret-down'
import IconCaretUp from '~icons/fa6-solid/caret-up'
import { useTimeAgo } from '@vueuse/core'

import { ref } from 'vue'

interface Contest {
  id: number
  img: string
  title: string
  description: string
  startTime: Date
  endTime: Date
}

const items: { [key: string]: Contest[] } = {
  ongoing: [
    {
      id: 1,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: '2021년 여름학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-08-17T00:00:00'),
      endTime: new Date('2022-12-18T11:59:00')
    }
  ],
  registerNow: [
    {
      id: 1,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: '2021년 여름학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-08-17T00:00:00'),
      endTime: new Date('2022-12-18T11:59:00')
    },
    {
      id: 2,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2021 Fall SKKU 프로그래밍 대회',
      description: '2021년 2학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-09-01T00:00:00'),
      endTime: new Date('2022-09-17T11:59:00')
    }
  ],
  upcoming: [
    {
      id: 3,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2023 Spring SKKU 프로그래밍 대회',
      description: '2023년 1학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-09-20T00:00:00'),
      endTime: new Date('2022-12-17T11:59:00')
    },
    {
      id: 4,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2022 Fall SKKU 프로그래밍 대회',
      description: '2023년 2학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-09-21T00:00:00'),
      endTime: new Date('2022-12-20T11:59:00')
    },
    {
      id: 5,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2023 Winter SKKU 프로그래밍 대회',
      description: '2023년 겨울학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2022-09-22T00:00:00'),
      endTime: new Date('2022-12-15T11:59:00')
    }
  ],
  finished: [
    {
      id: 6,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: '2021년 여름학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2020-09-22T00:00:00'),
      endTime: new Date('2020-12-15T11:59:00')
    },
    {
      id: 7,
      img: 'https://www.skku.edu/_res/skku/img/skku_s.png',
      title: '2021 Fall SKKU 프로그래밍 대회',
      description: '2021년 2학기 SKKU 프로그래밍 대회입니다.',
      startTime: new Date('2020-09-22T00:00:00'),
      endTime: new Date('2021-12-15T11:59:00')
    }
  ]
}

const coloredText = (id: string, item: Contest) => {
  if (id === 'ongoing' || id === 'registerNow')
    return 'Started ' + useTimeAgo(item.startTime).value
  else if (id === 'upcoming') return 'Start ' + useTimeAgo(item.startTime).value
  else return 'Finished ' + useTimeAgo(item.endTime).value
}

const coloredTextShort = (id: string, item: Contest) => {
  if (id in ['ongoing', 'registerNow', 'upcoming'])
    return useTimeAgo(item.startTime).value
  else return useTimeAgo(item.endTime).value
}

const showFinished = ref(false)
</script>

<template>
  <div
    v-for="({ title, id }, index) in [
      { title: 'Ongoing Contests', id: 'ongoing' },
      { title: 'Register Now Contests', id: 'registerNow' },
      { title: 'Upcoming Contests', id: 'upcoming' },
      { title: 'Finished Contests', id: 'finished' }
    ]"
    :key="index"
  >
    <div class="mt-8 mb-4 flex flex-row items-center">
      <PageSubtitle :text="title" :class="{ '!text-red': id === 'finished' }" />
      <IconAnglesRight v-if="id !== 'finished'" class="ml-2" />
      <div v-else>
        <IconCaretDown
          v-if="showFinished"
          class="text-red ml-2 cursor-pointer"
          @click="showFinished = !showFinished"
        />
        <IconCaretUp
          v-else
          class="text-red ml-2 cursor-pointer"
          @click="showFinished = !showFinished"
        />
      </div>
    </div>

    <div v-if="items[id].length === 0" class="text-gray-dark p-2.5 pl-4">
      No Contest
    </div>
    <div v-else>
      <div v-if="id !== 'finished' || showFinished">
        <div v-for="(item, idx) in items[id]" :key="idx">
          <CardItem
            :img="item.img"
            :title="item.title"
            :description="item.description"
            :colored-text="coloredText(id, item)"
            :colored-text-short="coloredTextShort(id, item)"
            class="mt-4"
            :border-color="id === 'finished' ? 'gray' : 'green'"
            @click="$router.push('/contest/' + item.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  title: SKKU Coding Platform Contests
  subtitle: Compete with schoolmates & win the prizes!
</route>
