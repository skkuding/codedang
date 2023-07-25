<script setup lang="ts">
import dummyImg from '@/common/assets/dummy.png'
import dummyImg2 from '@/common/assets/skkudingLogo.png'
import { defineAsyncComponent } from 'vue'
import Footer from '../components/Organism/Footer.vue'
import Header from '../components/Organism/Header.vue'

const Carousel = defineAsyncComponent(
  () => import('@/user/home/components/Carousel.vue')
)

const BoxTitle = defineAsyncComponent(
  () => import('@/common/components/Atom/BoxTitle.vue')
)
</script>

<template>
  <Header />
  <Carousel
    v-if="$router.currentRoute.value.meta.home"
    :slides="[
      {
        topTitle: '성균관대학교',
        bottomTitle: '제 1회 청정수컵',
        sub: '첫 번째 우승자가 될 기회!',
        img: dummyImg,
        imgAlt: 'dummy',
        color: 'green',
        href: '/'
      },
      {
        topTitle: 'SKKUDING',
        bottomTitle: '스꾸딩 23-2 신입부원 모집',
        sub: '프론트엔드 0명, 백엔드 0명',
        img: dummyImg2,
        imgAlt: 'dummy',
        color: 'black',
        href: '/'
      },
      {
        topTitle: 'SKKUDING',
        bottomTitle: '제 1회 해커톤',
        sub: '무박 2일, 1등 100만원',
        img: dummyImg2,
        imgAlt: 'dummy',
        color: 'white',
        href: '/'
      }
    ]"
  />
  <BoxTitle v-if="$router.currentRoute.value.meta.title">
    <template #title>
      {{ $router.currentRoute.value.meta.title }}
      <span
        v-if="$router.currentRoute.value.meta.coloredTitle"
        class="text-[#FEB144]"
      >
        {{ $router.currentRoute.value.meta.coloredTitle }}
      </span>
    </template>
    <template #subtitle>
      {{ $router.currentRoute.value.meta.subtitle }}
    </template>
  </BoxTitle>
  <main class="mx-auto mb-20 w-4/5 max-w-7xl">
    <RouterView />
  </main>
  <Footer />
</template>
