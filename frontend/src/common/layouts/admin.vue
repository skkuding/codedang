<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Organism/Sidebar.vue'

const group = ref(false)
console.log(group)
</script>

<template>
  <div class="flex w-full">
    <Sidebar :group="group" class="fixed bottom-0 left-0 top-0 flex-none" />
    <main class="ml-20 mr-20 flex-1 pl-48">
      <router-view @toggle-group="(value: boolean) => (group = value)" />
    </main>
  </div>
</template>
