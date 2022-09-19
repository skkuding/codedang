import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/common/store/auth'
import axios, { AxiosError } from 'axios'
import NProgress from 'nprogress'
import routes from 'virtual:generated-pages'
import App from './App.vue'

import 'nprogress/nprogress.css'
import './common/styles/style.css'

axios.interceptors.response.use(undefined, async (error: AxiosError) => {
  if (
    error.response?.status !== 401 ||
    error.config.url === '/api/auth/reissue' ||
    error.config.headers?.retry
  ) {
    throw error
  }

  await useAuthStore().reissue()

  /* to retry only once, use custom header `retry` as a flag */
  return axios({
    headers: {
      retry: 'retry',
      ...error.config.headers
    },
    ...error.config
  })
})

const app = createApp(App)
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(() => {
  NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

app.use(router)
app.use(createPinia())
app.mount('#app')
