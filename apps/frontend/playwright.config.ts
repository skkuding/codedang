import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  timeout: 30000,
  retries: 3,
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
  testDir: './playwright/tests/',
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
    },
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'] }
    }
  ]
})
