import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/playwright/**'],
    env: {
      NEXT_PUBLIC_BASEURL: 'https://test.com/api',
      NEXTAUTH_URL: 'https://test.com/next-auth/api/auth'
    }
  },
  resolve: {
    alias: [{ find: '@', replacement: __dirname }]
  }
})
