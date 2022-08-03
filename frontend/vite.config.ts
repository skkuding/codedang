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
        { dir: 'src/workbook/pages', baseRoute: 'workbook' },
        { dir: 'src/contest/pages', baseRoute: 'contest' },
        { dir: 'src/group/pages', baseRoute: 'group' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // configure vite for HMR with Gitpod
    hmr: process.env.GITPOD_HOST
      ? {
          // removes the protocol and replaces it with the port we're connecting to
          host: process.env.GITPOD_WORKSPACE_URL?.replace('https://', '3000-'),
          protocol: 'wss',
          clientPort: 443
        }
      : true
  }
})
