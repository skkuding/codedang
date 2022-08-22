<script setup lang="ts">
import BoxTitle from '../../common/components/Atom/BoxTitle.vue'
import PageSubtitle from '../../common/components/Atom/PageSubtitle.vue'
import CardItem from '../../common/components/Molecule/CardItem.vue'
import Footer from '../../common/components/Organism/Footer.vue'
import Trophy from '~icons/fxemoji/trophy'

// ongoing contest, register now, upcoming contests, finished contest 별로 array
// 선언하고 splice 형태로 각 특성 분류

// Icon이랑 색감 BoxTitle 색감 어떻게 줄까
const contestList = [
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  },
  {
    img: '@/../skku.svg',
    title: '2021 Spring SKKU 프로그래밍 대회 - 참여중 대회',
    additionalText: 'Member: 23',
    description: 'SKKU 코딩 플랫폼 개발 동아리입니다.',
    coloredText: 'Created by 하설빙',
    coloredTextShort: 'By 하설빙'
  }
]
</script>

<template>
  <Header />
  <BoxTitle>
    <template #title>
      <Trophy class="inline-block" />
      SKKU Coding Platform
      <span class="!text-blue">Contests</span>
    </template>
    <template #subtitle>Compete with schoolmates & win the prizes!</template>
  </BoxTitle>
  <div class="m-24">
    <PageSubtitle text="Ongoing Contest > >" />
    <CardItem
      v-for="(items, index) in contestList"
      :key="index"
      :img="items.img"
      :title="items.title"
      :description="items.description"
      :additional-text="items.additionalText"
      :colored-text="items.coloredText"
      :colored-text-short="items.coloredTextShort"
    />
    <PageSubtitle text="Register Now > >" />
    <CardItem
      v-for="(items, index) in contestList"
      :key="index"
      :img="items.img"
      :title="items.title"
      :description="items.description"
      :additional-text="items.additionalText"
      :colored-text="items.coloredText"
      :colored-text-short="items.coloredTextShort"
    />
    <PageSubtitle text="Upcoming Contests > >" />
    <CardItem
      v-for="(items, index) in contestList"
      :key="index"
      :img="items.img"
      :title="items.title"
      :description="items.description"
      :additional-text="items.additionalText"
      :colored-text="items.coloredText"
      :colored-text-short="items.coloredTextShort"
    />
    <PageSubtitle text="Finished Contests" />
    <CardItem
      v-for="(items, index) in contestList"
      :key="index"
      :img="items.img"
      :title="items.title"
      :description="items.description"
      :additional-text="items.additionalText"
      :colored-text="items.coloredText"
      :colored-text-short="items.coloredTextShort"
    />
  </div>
  <Footer />
</template>
