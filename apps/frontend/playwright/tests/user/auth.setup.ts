import { test as setup, expect } from '@playwright/test'

const userFile = 'playwright/.auth/user.json'

setup('Authenticate as user', { tag: '@login' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByPlaceholder('User ID').fill('user01')
  await page.getByPlaceholder('Password').fill('Useruser')
  await page.getByRole('button', { name: 'Log In' }).click()

  await expect(page.getByRole('button', { name: 'user01' })).toBeVisible()

  await page.context().storageState({ path: userFile })
})
