<script setup lang="ts">
import Sidebar from '../components/Organism/Sidebar.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
</script>

<template>
  <div class="flex w-full">
    <Sidebar
      :group="$router.currentRoute.value.meta.group as string"
      class="flex-none"
    />
    <main class="h-screen flex-1 overflow-auto p-20">
      <div v-if="$router.currentRoute.value.meta.group">
        <PageSubtitle
          class="text-end uppercase"
          :text="$router.currentRoute.value.meta.group as string"
        />
        <hr class="mt-2 mb-10" />
      </div>
      <router-view />
    </main>
  </div>
</template>
