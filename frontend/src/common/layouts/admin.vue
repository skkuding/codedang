<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Organism/Sidebar.vue'

const group = ref(false)
</script>

<template>
  <div class="flex w-fit">
    <Sidebar :group="group" />
    <router-view @toggle-group="(value: boolean) => (group = value)" />
  </div>
</template>
