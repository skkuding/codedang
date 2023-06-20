<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
import { useAuthStore } from './common/store/auth'
import { useRouter } from 'vue-router'

// check if refresh token is valid
useAuthStore().reissue()
const router = useRouter()
</script>

<template>
  <router-view :key="router.currentRoute.value.fullPath" />
  <Toast />
</template>
