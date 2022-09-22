<script setup lang="ts">
import Sidebar from '../components/Organism/Sidebar.vue'
</script>

<template>
  <div class="flex w-fit">
    <Sidebar />
    <router-view />
  </div>
</template>
