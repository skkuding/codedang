import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import icons from 'unplugin-icons/vite'
import pages from 'vite-plugin-pages'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    icons({ autoInstall: true }),
    pages({
      pagesDir: [
        { dir: 'src/user/home/pages', baseRoute: '' },
        { dir: 'src/user/notice/pages', baseRoute: 'notice' },
        { dir: 'src/user/problem/pages', baseRoute: 'problem' },
        { dir: 'src/user/contest/pages', baseRoute: 'contest' },
        { dir: 'src/user/group/pages', baseRoute: 'group' },
        { dir: 'src/manager/pages', baseRoute: 'manager' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
