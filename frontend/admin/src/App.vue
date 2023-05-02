<script setup lang="ts">
import { useAuthStore } from '@/client/src/common/store/auth'

// check if refresh token is valid
useAuthStore().reissue()
</script>

<template>
  <router-view />
  <Toast />
</template>
