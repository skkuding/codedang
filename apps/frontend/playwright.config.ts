import {
  defineConfig,
  devices,
  type PlaywrightTestConfig
} from '@playwright/test'

export default defineConfig({
  testDir: './playwright/tests/',
  retries: 3,
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright/test-results.json' }]
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5525',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  use: {
    baseURL: 'http://localhost:5525'
  },
  projects: [
    // Setup projects
    {
      name: 'Admin Setup',
      testDir: './playwright/tests/admin',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'User Setup',
      testDir: './playwright/tests/user',
      testMatch: /.*\.setup\.ts/
    },
    ...getProjectsByBrowser()
  ]
})

function getProjectsByBrowser(): NonNullable<PlaywrightTestConfig['projects']> {
  const browsers = [
    'Desktop Safari',
    'Desktop Firefox',
    'Desktop Chrome',
    'Desktop Edge'
  ] as const

  return browsers.flatMap((browser) => [
    {
      name: browser,
      testDir: './playwright/tests/non-auth',
      use: {
        ...devices[browser]
      }
    },
    {
      name: `${browser} (User)`,
      testDir: './playwright/tests/user',
      dependencies: ['User Setup'],
      use: {
        ...devices[browser],
        storageState: 'playwright/.auth/user.json'
      }
    },
    {
      name: `${browser} (Admin)`,
      testDir: './playwright/tests/admin',
      dependencies: ['Admin Setup'],
      use: {
        ...devices[browser],
        storageState: 'playwright/.auth/admin.json'
      }
    }
  ])
}
