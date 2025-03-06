import { test as setup, expect } from '@playwright/test'

const adminFile = 'playwright/.auth/admin.json'

setup('Authenticate as admin', { tag: '@login' }, async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Log In' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByPlaceholder('User ID').fill('admin')
  await page.getByPlaceholder('Password').fill('Adminadmin')
  await page.getByRole('button', { name: 'Log In' }).click()

  await expect(page.getByRole('button', { name: 'admin' })).toBeVisible()

  await page.context().storageState({ path: adminFile })
})
