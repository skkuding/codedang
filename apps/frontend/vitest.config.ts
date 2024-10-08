import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    env: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      NEXT_PUBLIC_BASEURL: 'https://test.com/api',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      NEXTAUTH_URL: 'https://test.com/next-auth/api/auth'
    }
  },
  resolve: {
    alias: [{ find: '@', replacement: __dirname }]
  }
})
