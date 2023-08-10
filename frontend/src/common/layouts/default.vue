<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Footer from '../components/Organism/Footer.vue'
import Header from '../components/Organism/Header.vue'

const BoxTitle = defineAsyncComponent(
  () => import('@/common/components/Atom/BoxTitle.vue')
)
</script>

<template>
  <div class="flex h-full flex-col justify-between">
    <div>
      <Header />
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
      <main class="mx-auto w-full max-w-7xl p-5">
        <RouterView />
      </main>
    </div>
    <Footer />
  </div>
</template>
