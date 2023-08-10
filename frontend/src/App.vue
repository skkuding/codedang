<script setup lang="ts">
import Toast from '@/common/components/Atom/Toast.vue'
import { NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'
import { useAuthStore } from './common/store/auth'

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#8dc63f'
  },
  DataTable: {
    thTextColor: '#7C7A7B',
    thFontWeight: 'bold',
    tdTextColor: '#212529'
  },
  Button: {
    textColorHover: '#8dc63f',
    borderHover: '1px solid #8dc63f'
  },
  Pagination: {
    itemTextColorHover: '#8dc63f'
  }
}

// check if refresh token is valid
useAuthStore().reissue()
</script>

<template>
  <n-config-provider class="relative h-full" :theme-overrides="themeOverrides">
    <RouterView />
    <Toast />
  </n-config-provider>
</template>
