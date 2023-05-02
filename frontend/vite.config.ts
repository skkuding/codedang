/* eslint-disable @typescript-eslint/naming-convention */
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import icons from 'unplugin-icons/vite'
import pages from 'vite-plugin-pages'
import layouts from 'vite-plugin-vue-layouts'
import checker from 'vite-plugin-checker'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client',
  plugins: [
    vue(),
    icons({ autoInstall: true }),
    pages({
      exclude: ['**/*.ts', '**/App.vue'],
      pagesDir: [
        { dir: 'src/user/home/pages', baseRoute: '' },
        { dir: 'src/user/notice/pages', baseRoute: 'notice' },
        { dir: 'src/user/problem/pages', baseRoute: 'problem' },
        { dir: 'src/user/contest/pages', baseRoute: 'contest' },
        { dir: 'src/user/group/pages', baseRoute: 'group' },
        { dir: 'src/user/workbook/pages', baseRoute: 'workbook' },
        { dir: '../admin/src/manager/pages', baseRoute: 'admin' }
      ]
    }),
    layouts({
      layoutsDirs: 'src/common/layouts'
    }),
    checker({
      eslint: { lintCommand: 'eslint "src/**/*.{ts,vue}"' },
      vueTsc: true
    })
  ],
  build: {
    rollupOptions: {
      input: {
        admin: fileURLToPath(new URL('./admin/index.html', import.meta.url)),
        client: fileURLToPath(new URL('./client/index.html', import.meta.url))
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
