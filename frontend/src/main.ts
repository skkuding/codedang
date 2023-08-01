import { useAuthStore } from '@/common/store/auth'
import {
  ApolloClient,
  ApolloLink,
  from,
  HttpLink,
  InMemoryCache
} from '@apollo/client/core'
import { ApolloClients } from '@vue/apollo-composable'
import axios from 'axios'
import axiosRetry from 'axios-retry'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { createPinia } from 'pinia'
import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import { createApp, provide, h } from 'vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'
import { VueQueryPlugin } from 'vue-query'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
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
// const apolloClient = new ApolloClient({
//   // You should use an absolute URL here
//   uri: 'https://dev.codedang.com/graphql'
// })
const link = from([
  new ApolloLink((operation, forward) => {
    operation.setContext(({ headers }: { headers: object }) => ({
      headers: {
        ...headers,
        authorization: axios.defaults.headers.common.authorization
      }
    }))
    return forward(operation) // Go to the next link in the chain. Similar to `next` in Express.js middleware.
  }),
  new HttpLink({ uri: 'https://dev.codedang.com/graphql' })
])
const cache = new InMemoryCache()
const apolloClient = new ApolloClient({ link, cache })
const app = createApp({
  setup() {
    provide(ApolloClients, {
      default: apolloClient
    })
  },
  render: () => h(App)
})

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
app.use(VueQueryPlugin)
app.mount('#app')
