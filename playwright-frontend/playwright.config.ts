import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  timeout: 30000,
  retries: 2,
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
  testDir: '/tests',
  testMatch: '**/*.{spec,test}.{ts.js}',
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})
