<script setup lang="ts">
import BoxTitle from '../../common/components/Atom/BoxTitle.vue'
import PageSubtitle from '../../common/components/Atom/PageSubtitle.vue'
import CardItem from '../../common/components/Molecule/CardItem.vue'
import Modal from '../../common/components/Molecule/Modal.vue'
import Trophy from '~icons/fxemoji/trophy'
import IconAngleRight from '~icons/fa6-solid/angle-right'
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
      id: 0,
      img: '@/../skku.svg',
      title: '2021 Spring SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-01-17T00:24:00'),
      endTime: new Date('2022-12-17T03:24:00')
    }
  ],
  registerNow: [
    {
      id: 1,
      img: '@/../skku.svg',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-08-17T00:00:00'),
      endTime: new Date('2022-12-18T11:59:00')
    },
    {
      id: 2,
      img: '@/../skku.svg',
      title: '2021 Fall SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-09-01T00:00:00'),
      endTime: new Date('2022-09-17T11:59:00')
    }
  ],
  upcoming: [
    {
      id: 3,
      img: '@/../skku.svg',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-09-20T00:00:00'),
      endTime: new Date('2022-12-17T11:59:00')
    },
    {
      id: 4,
      img: '@/../skku.svg',
      title: '2021 Fall SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-09-21T00:00:00'),
      endTime: new Date('2022-12-20T11:59:00')
    },
    {
      id: 5,
      img: '@/../skku.svg',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2022-09-22T00:00:00'),
      endTime: new Date('2022-12-15T11:59:00')
    }
  ],
  finished: [
    {
      id: 6,
      img: '@/../skku.svg',
      title: '2021 Summer SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2020-09-22T00:00:00'),
      endTime: new Date('2020-12-15T11:59:00')
    },
    {
      id: 7,
      img: '@/../skku.svg',
      title: '2021 Fall SKKU 프로그래밍 대회',
      description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
      startTime: new Date('2020-09-22T00:00:00'),
      endTime: new Date('2021-12-15T11:59:00')
    }
  ]
}

const coloredText = (id: string, item: Contest) => {
  if (id === 'ongoing' || id === 'registerNow') {
    return 'Started ' + useTimeAgo(item.startTime).value
  } else if (id === 'upcoming') {
    return 'Start ' + useTimeAgo(item.startTime).value
  } else {
    return 'Finished ' + useTimeAgo(item.endTime).value
  }
}

const coloredTextShort = (id: string, item: Contest) => {
  if (id === 'ongoing' || id === 'registerNow' || id === 'upcoming') {
    return useTimeAgo(item.startTime).value
  } else {
    return useTimeAgo(item.endTime).value
  }
}

const showFinished = ref(false)

const isModalVisible = ref(false)
const modalTitle = ref('')
const popModal = (item: Contest) => {
  isModalVisible.value = true
  modalTitle.value = item.title
}
</script>

<template>
  <BoxTitle>
    <template #title>
      <Trophy class="mr-4 inline-block" />
      SKKU Coding Platform
      <span class="!text-[#FEB144]">Contests</span>
    </template>
    <template #subtitle>Compete with schoolmates & win the prizes!</template>
  </BoxTitle>

  <div
    v-for="({ title, id }, index) in [
      { title: 'Ongoing Contests', id: 'ongoing' },
      { title: 'Register Now Contests', id: 'registerNow' },
      { title: 'Upcoming Contests', id: 'upcoming' },
      { title: 'Finished Contests', id: 'finished' }
    ]"
    :key="index"
  >
    <div v-if="id !== 'finished'" class="mt-8 mb-4 flex flex-row items-center">
      <PageSubtitle :text="title" />
      <IconAngleRight class="ml-2" />
      <IconAngleRight />
    </div>
    <div v-else class="mt-8 mb-4 flex flex-row items-center">
      <PageSubtitle text="Finished Contests" class="!text-red" />
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

    <div v-for="(item, idx) in items[id]" :key="idx">
      <CardItem
        v-if="id !== 'finished' || (id === 'finished' && showFinished)"
        :img="item.img"
        :title="item.title"
        :description="item.description"
        :colored-text="coloredText(id, item)"
        :colored-text-short="coloredTextShort(id, item)"
        class="mt-4"
        :border-color="id === 'finished' ? 'gray' : 'green'"
        @click="popModal(item)"
      />
    </div>
  </div>

  <Modal
    v-if="isModalVisible"
    :title="modalTitle"
    class="h-40"
    @close="isModalVisible = false"
  />
</template>
