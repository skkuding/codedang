<script setup lang="ts">
import Header from '../components/Organism/Header.vue'
import Footer from '../components/Organism/Footer.vue'
</script>

<template>
  <Header />
  <router-view class="mx-auto w-4/5 max-w-7xl" />
  <Footer />
</template>
