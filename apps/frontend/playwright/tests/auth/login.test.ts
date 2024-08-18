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

  const checkLoginState = async () => {
    const isUserProfileVisible = await auth.userProfile.isVisible()
    const isLoginButtonVisible = await auth.loginButton.isVisible()

    expect(isUserProfileVisible).toBe(true)
    expect(isLoginButtonVisible).toBe(false)
  }

  const loginProcess = async () => {
    await auth.login('admin', 'Adminadmin')
    await auth.page.waitForSelector('svg.h-6.w-6.text-white')

    const token = await auth.getJWTToken()
    expect(token).not.toBeNull()

    if (token) {
      await auth.page.evaluate((t) => {
        localStorage.setItem('token', t)
      }, token)
    }
    await checkLoginState()
  }

  test('Log in via homepage', async () => {
    await auth.clickLoginButton()
    await auth.page.waitForSelector(
      'div.flex.h-full.w-full.flex-col.justify-between'
    )
    expect(await auth.loginModalVisible()).toBe(true)
    await loginProcess()
  })

  test('Log in via sign up modal', async () => {
    await auth.clickSignupButton()
    await auth.page.waitForSelector(
      'div.flex.h-full.flex-col.items-center.justify-center'
    )
    expect(await auth.signupModalVisible()).toBe(true)
    await auth.clickLoginButtonInSignupModal()
    await auth.page.waitForSelector(
      'div.flex.h-full.w-full.flex-col.justify-between'
    )
    expect(await auth.loginModalVisible()).toBe(true)
    await loginProcess()
  })
})
