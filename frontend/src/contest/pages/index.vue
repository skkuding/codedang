<script setup lang="ts">
import BoxTitle from '../../common/components/Atom/BoxTitle.vue'
import Button from '../../common/components/Atom/Button.vue'
import PageSubtitle from '../../common/components/Atom/PageSubtitle.vue'
import CardItem from '../../common/components/Molecule/CardItem.vue'
import Footer from '../../common/components/Organism/Footer.vue'
import Modal from '../../common/components/Molecule/Modal.vue'
import Header from '../../common/components/Organism/Header.vue'
import Trophy from '~icons/fxemoji/trophy'
import { ref } from 'vue'

// ongoing contest, register now, upcoming contests, finished contest 별로 array
// 선언하고 splice 형태로 각 특성 분류

// Icon이랑 색감 BoxTitle 색감 어떻게 줄까
const onGoingList = [
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회0',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  }
]

const registerNowList = [
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회0',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회1',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회2',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  }
]

const upComingList = [
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회0',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회1',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회2',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회3',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  }
]

const finishedList = [
  {
    borderColor: 'red',
    img: '@/../skku.svg',
    title: '2021 Summer SKKU 프로그래밍 대회 - 참여중 대회0',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    borderColor: 'red',
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회1',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  }
]

const modalIndex = ref(0)
const isModalVisible = ref(false)
const closeModal = (index: any) => {
  modalIndex.value = index
  isModalVisible.value = false
}
const popModal = (index: any) => {
  console.log(index)
  modalIndex.value = index
  isModalVisible.value = true
}
</script>

<template>
  <Header />
  <BoxTitle>
    <template #title>
      <Trophy class="mr-4 inline-block" />
      SKKU Coding Platform
      <span class="!text-blue">Contests</span>
    </template>
    <template #subtitle>Compete with schoolmates & win the prizes!</template>
  </BoxTitle>
  <div class="mx-auto grid w-11/12">
    <PageSubtitle text="Ongoing Contest > >" class="mt-8 mb-4" />
    <div v-for="(items, index) in onGoingList" :key="index">
      <CardItem
        :img="items.img"
        :title="items.title"
        :description="items.description"
        :additional-text="items.additionalText"
        :colored-text="items.coloredText"
        :colored-text-short="items.coloredTextShort"
        class="mb-4"
        @click="popModal(index)"
      />
      <Modal
        v-if="isModalVisible && modalIndex === index"
        :key="index"
        :title="items.title"
        class="h-40"
        @close="closeModal(index)"
      />
    </div>
    <PageSubtitle text="Register Now > >" class="mt-8 mb-4" />
    <div v-for="(items, index) in registerNowList" :key="index">
      <CardItem
        :img="items.img"
        :title="items.title"
        :description="items.description"
        :additional-text="items.additionalText"
        :colored-text="items.coloredText"
        :colored-text-short="items.coloredTextShort"
        class="mb-4"
        @click="popModal(index)"
      />
      <Modal
        v-if="isModalVisible && modalIndex === index"
        :key="index"
        :title="items.title"
        class="h-40"
        @close="closeModal(index)"
      />
    </div>
    <PageSubtitle text="Upcoming Contests > >" class="mt-8 mb-4" />
    <div v-for="(items, index) in upComingList" :key="index">
      <CardItem
        :img="items.img"
        :title="items.title"
        :description="items.description"
        :additional-text="items.additionalText"
        :colored-text="items.coloredText"
        :colored-text-short="items.coloredTextShort"
        @click="popModal(index)"
        class="mb-4"
      />
      <Modal
        v-if="isModalVisible && modalIndex === index"
        :key="index"
        :title="items.title"
        class="h-40"
        @close="closeModal(index)"
      />
    </div>
    <div class="mt-8 flex">
      <PageSubtitle text="Finished Contests" class="!text-red mb-4" />
      <Button class="bg-red"></Button>
    </div>
    <div v-for="(items, index) in finishedList" :key="index">
      <CardItem
        border-color="gray"
        :img="items.img"
        :title="items.title"
        :description="items.description"
        :additional-text="items.additionalText"
        :colored-text="items.coloredText"
        :colored-text-short="items.coloredTextShort"
        class="mb-4"
        @click="popModal(index)"
      />
      <Modal
        v-if="isModalVisible && modalIndex === index"
        :key="index"
        :title="items.title"
        class="h-40"
        @close="closeModal(index)"
      />
    </div>
  </div>
</template>
