import { test, expect } from '@playwright/test'
import { Auth } from '../../pages/auth.page'

test.describe('Login Tests', { tag: '@login' }, () => {
  let auth: Auth

  test.beforeEach(async ({ page }) => {
    auth = new Auth(page)
    await auth.goToMain()
  })

  test('Log in via homepage', async () => {
    await auth.clickLoginButton()
    expect(await auth.loginModal).toBeVisible()
    await auth.login('user01', 'Useruser')
  })

  test('Log in via sign up modal', async () => {
    await auth.clickSignUpButton()
    expect(await auth.signUpModal).toBeVisible()
    await auth.clickLoginButtonInSignUpModal()
    expect(await auth.loginModal).toBeVisible()
    await auth.login('user01', 'Useruser')
  })
})
