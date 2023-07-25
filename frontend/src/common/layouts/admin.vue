<script setup lang="ts">
import Sidebar from '../components/Organism/Sidebar.vue'
</script>

<template>
  <div class="flex w-full">
    <Sidebar class="fixed bottom-0 left-0 top-0 flex-none" />
    <main class="ml-48 w-[calc(100%-12rem)] flex-1 px-20 py-10">
      <RouterView />
    </main>
  </div>
</template>
