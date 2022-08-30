<script setup lang="ts">
import Footer from './common/components/Organism/Footer.vue'
import Header from './common/components/Organism/Header.vue'
</script>

<template>
  <Header />
  <div class="mx-auto w-4/5">
    <router-view />
  </div>
  <Footer />
</template>
