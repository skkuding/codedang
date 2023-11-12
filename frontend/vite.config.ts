/* eslint-disable @typescript-eslint/naming-convention */
import vue from '@vitejs/plugin-vue'
import icons from 'unplugin-icons/vite'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import pages from 'vite-plugin-pages'
import layouts from 'vite-plugin-vue-layouts'

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
        { dir: 'src/user/workbook/pages', baseRoute: 'workbook' },
        { dir: 'src/admin/pages', baseRoute: 'admin' }
      ]
    }),
    layouts({
      layoutsDirs: 'src/common/layouts'
    }),
    checker({
      eslint: { lintCommand: 'eslint "./src/**/*.{ts,vue}"' },
      vueTsc: true,
      enableBuild: false
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://dev.codedang.com',
        changeOrigin: true
      },
      '/graphql': {
        target: 'https://dev.codedang.com',
        changeOrigin: true
      }
    }
  },
  optimizeDeps: {
    exclude: ['@codemirror/state']
  }
})
