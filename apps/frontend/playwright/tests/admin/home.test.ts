import { expect, test } from '@playwright/test'

test.describe('Home page test', () => {
  test('Admin can go to the management page through the account menu', async ({
    page
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'admin' }).click()

    await expect(page.getByRole('menu')).toBeVisible()

    await page.getByRole('menuitem', { name: 'Management' }).click()

    await page.waitForURL('/admin')
  })
})
