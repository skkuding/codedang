import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/common/store/auth'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import NProgress from 'nprogress'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import App from './App.vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'

import 'nprogress/nprogress.css'
import './common/styles/style.css'

// Retry 401 failed request to reissue access token
// since access token expiresin short time.
// Refresh token is stored in cookie, which expires after long time.
axiosRetry(axios, {
  retries: 1,
  retryCondition: (error) =>
    error.response?.status === 401 && error.config?.url !== '/api/auth/reissue',
  onRetry: async () => {
    await useAuthStore().reissue()
  }
})

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(generatedRoutes)
})

router.beforeEach(() => {
  NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

app.use(router)
app.use(createPinia())
app.use(VueDOMPurifyHTML)
app.mount('#app')
