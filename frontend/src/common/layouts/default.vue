<script setup lang="ts">
import Header from '../components/Organism/Header.vue'
import Footer from '../components/Organism/Footer.vue'
import { defineAsyncComponent } from 'vue'

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
      'https://picsum.photos/id/1032/900/400',
      'https://picsum.photos/id/1033/900/400',
      'https://picsum.photos/id/1037/900/400',
      'https://picsum.photos/id/1035/900/400',
      'https://picsum.photos/id/1036/900/400'
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
    <router-view />
  </main>
  <Footer />
</template>
