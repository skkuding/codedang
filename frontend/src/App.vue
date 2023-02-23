<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
import { useAuthStore } from './common/store/auth'

// check if refresh token is valid
await useAuthStore().reissue()
</script>

<template>
  <router-view :key="$router.currentRoute.value.fullPath" />
  <Toast />
</template>
