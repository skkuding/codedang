<script setup lang="ts">
import Header from '../components/Organism/Header.vue'
import Footer from '../components/Organism/Footer.vue'
import { defineAsyncComponent } from 'vue'

const Carousel = defineAsyncComponent(
  () => import('@/user/home/components/Carousel.vue')
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
  <router-view class="mx-auto w-4/5 max-w-7xl" />
  <Footer />
</template>
