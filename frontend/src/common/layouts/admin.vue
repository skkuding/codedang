<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Organism/Sidebar.vue'

const group = ref(false)
</script>

<template>
  <div class="flex w-full">
    <Sidebar :group="group" class="flex-none" />
    <main class="h-screen flex-1 overflow-auto">
      <router-view @toggle-group="(value: boolean) => (group = value)" />
    </main>
  </div>
</template>
