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
        { dir: 'src/home/pages', baseRoute: '' },
        { dir: 'src/notice/pages', baseRoute: 'notice' },
        { dir: 'src/problem/pages', baseRoute: 'problem' },
        { dir: 'src/contest/pages', baseRoute: 'contest' },
        { dir: 'src/group/pages', baseRoute: 'group' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
