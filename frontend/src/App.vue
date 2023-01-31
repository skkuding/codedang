<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
</script>

<template>
  <router-view :key="$router.currentRoute.value.fullPath" />
  <Toast />
</template>
