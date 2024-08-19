import { test, expect } from '@playwright/test'
import { HomePage } from '../../pages/home.page'

test.describe('Homepage Tests', () => {
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    await homePage.goTo()
  })

  test('go to home page', async () => {
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.homePageUrl)
  })

  test('go to homepage when clicking main logo', async () => {
    await homePage.clickMainLogo()
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.homePageUrl)
  })

  test('go to notice page when clicking notice button', async () => {
    await homePage.clickNoticeButton()
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.noticePageUrl)
  })

  test('go to contest page when clicking contest button', async () => {
    await homePage.clickContestButton()
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.contestPageUrl)
  })

  test('go to problem page when clicking problem button', async () => {
    await homePage.clickProblemButton()
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.problemPageUrl)
  })

  test('go to problem page when clicking seemore button', async () => {
    await homePage.clickSeemoreButton()
    const currentUrl = await homePage.getCurrentUrl()
    expect(currentUrl).toBe(homePage.seeMorePageUrl)
  })

  test('open forgot ID/password modal from login modal', async () => {
    await homePage.clickLoginButton()
    expect(await homePage.loginModalVisible()).toBe(true)

    await homePage.clickForgotIDPasswordButton()
    expect(await homePage.forgotIDPasswordModalVisible()).toBe(true)
  })

  //test('close login modal when clicking close button', async () => {
  //  await homePage.clickLoginButton()
  //await homePage.closeLoginModal()
  //expect(await homePage.loginModalVisible()).toBe(false)
  //})

  test('open signup modal when clicking signup button', async () => {
    await homePage.clickSignupButton()
    expect(await homePage.signupModalVisible()).toBe(true)
  })

  //test('close signup modal when clicking close button', async () => {
  //await homePage.clickSignupButton()
  //await homePage.closeSignupModal()
  //expect(await homePage.signupModalVisible()).toBe(false)
  //})
})
