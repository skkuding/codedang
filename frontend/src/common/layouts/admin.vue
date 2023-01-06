<script setup lang="ts">
import Sidebar from '../components/Organism/Sidebar.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import { useGroupStore } from '../store/group'
const group = useGroupStore()
</script>

<template>
  <div class="flex w-full">
    <Sidebar
      :group="{
        id: group.id,
        name: group.name,
        color: group.color
      }"
      class="flex-none"
    />
    <main class="h-screen flex-1 overflow-auto p-20">
      <div v-if="group.id > 0">
        <PageSubtitle class="text-end uppercase" :text="group.name" />
        <hr class="mt-2 mb-10" />
      </div>
      <router-view />
    </main>
  </div>
</template>
