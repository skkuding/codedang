<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
import Footer from './common/components/Organism/Footer.vue'
import Header from './common/components/Organism/Header.vue'
</script>

<template>
  <div class="mx-auto w-4/5 max-w-7xl">
    <router-view />
    <Toast />
  </div>
</template>
