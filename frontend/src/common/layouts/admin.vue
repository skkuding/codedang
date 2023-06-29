<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Organism/Sidebar.vue'

const group = ref(false)
</script>

<template>
  <div class="flex w-full">
    <Sidebar :group="group" class="fixed bottom-0 left-0 top-0 flex-none" />
    <main class="ml-48 w-[calc(100%-12rem)] flex-1 px-20 py-10">
      <router-view @toggle-group="(value: boolean) => (group = value)" />
    </main>
  </div>
</template>
