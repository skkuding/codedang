import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import NProgress from 'nprogress'
import routes from 'virtual:generated-pages'
import App from './App.vue'
import VueDOMPurifyHTML from 'vue-dompurify-html'

import 'nprogress/nprogress.css'
import './common/styles/style.css'

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
app.use(VueDOMPurifyHTML)
app.mount('#app')
