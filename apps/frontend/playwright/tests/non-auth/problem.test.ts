import { expect, test } from '@playwright/test'

const PROBLEM_ID = 101
test.describe('Problem detail page test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/problem/${PROBLEM_ID}`)
  })
  test('Toast message should be displayed to guide log in when accessing the page', async ({
    page
  }) => {
    await expect(
      page.getByText(/Log in to use submission & save feature/).first()
    ).toBeVisible()
  })

  test('Login form and toast message should be displayed to guide log in when clicking save button', async ({
    page
  }) => {
    await page.getByRole('textbox').fill('asdf')
    await page.getByRole('button', { name: 'Save' }).click()
    await expect(page.getByRole('form', { name: 'Log in' })).toBeVisible()
    await expect(page.getByText(/Log in first to save your code/)).toBeVisible()
  })

  test('Login form and toast message should be displayed when clicking submit button', async ({
    page
  }) => {
    await page.getByRole('textbox').fill('asdf')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByRole('form', { name: 'Log in' })).toBeVisible()
    await expect(
      page.getByText(/Log in first to submit your code/)
    ).toBeVisible()
  })

  test('Login form and toast message should be displayed when clicking test button', async ({
    page
  }) => {
    await page.getByRole('textbox').fill('asdf')
    await page.getByRole('button', { name: 'Test', exact: true }).click()
    await expect(page.getByRole('form', { name: 'Log in' })).toBeVisible()
    await expect(page.getByText(/Log in first to test your code/)).toBeVisible()
  })
})
