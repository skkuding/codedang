import { test, expect } from '@playwright/test'
import { Auth } from '../../pages/auth.page'
import { HomePage } from '../../pages/home.page'

test.describe('Login Tests', () => {
  let auth: Auth
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    auth = new Auth(page)
    homePage = new HomePage(page)
    await homePage.goTo()
  })

  test('Log in via homepage', async () => {
    await auth.clickLoginButton()
    expect(await auth.loginModalVisible()).toBe(true)

    await auth.login('admin', 'Adminadmin')
    expect(await homePage.page.isVisible(auth.userProfile)).toBe(true)
    expect(await homePage.page.isVisible(auth.loginButton)).toBe(false)
  })

  test('Log in via sign up modal', async () => {
    await auth.clickSignupButton()
    expect(await auth.signupModalVisible()).toBe(true)

    await auth.clickLoginButtonInSignupModal()
    expect(await auth.loginModalVisible()).toBe(true)

    await auth.login('admin', 'Adminadmin')

    //change into next-auth session test or just add
    expect(await homePage.page.isVisible(auth.userProfile)).toBe(true)
    expect(await homePage.page.isVisible(auth.loginButton)).toBe(false)
  })
})
