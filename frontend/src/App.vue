<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
import { useAuthStore } from './common/store/auth'
import { NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'

const themeOverrides: GlobalThemeOverrides = {
  DataTable: {
    thTextColor: '#7C7A7B',
    thFontWeight: 'bold',
    tdTextColor: '#212529'
  }
}

// check if refresh token is valid
useAuthStore().reissue()
</script>

<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view />
    <Toast />
  </n-config-provider>
</template>
