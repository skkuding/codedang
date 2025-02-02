import { ContestOverallTabs } from '@/app/admin/contest/[contestId]/_components/ContestOverallTabs'
import type { Page, Locator } from '@playwright/test'

export class Auth {
  public readonly page: Page
  public readonly loginButton: Locator
  public readonly loginModal: Locator
  public readonly loginModalCloseButton: Locator
  public readonly loginButtonInSignUpModal: Locator
  public readonly loginSubmitButton: Locator

  public readonly forgotIDPasswordButton: Locator
  public readonly forgotIDPasswordModalCloseButton: Locator
  public readonly forgotEmailAddressSelector: Locator
  public readonly forgotFindUserIDButton: Locator
  public readonly forgotResetPasswordButton: Locator
  public readonly forgotRegisterNowButton: Locator

  public readonly signUpButton: Locator
  public readonly signUpModal: Locator
  public readonly signUpModalCloseButton: Locator
  public readonly signUpButtonInLoginModal: Locator
  public readonly sendEmailButton: Locator
  public readonly signUpEmailAdressSelector: Locator
  public readonly signUpVerificationCode: Locator
  public readonly signUpVerificationCodeNextButton: Locator
  public readonly signUpYourName: Locator
  public readonly signUpUserID: Locator
  public readonly signUpPassword: Locator
  public readonly signUpReenterPassword: Locator
  public readonly signUpRegisterButton: Locator

  public readonly usernameSelector: Locator
  public readonly passwordSelector: Locator

  public readonly userProfile: Locator
  public readonly logoutButton: Locator
  public readonly managementButton: Locator

  constructor(page: Page) {
    this.page = page
    this.loginButton = page.getByRole('button', { name: 'Log In' })
    this.loginModal = page.locator(
      'div.flex.h-full.w-full.flex-col.justify-between'
    )
    this.loginModalCloseButton = page.locator('svg.lucide.lucide-x.h-4.w-4')
    this.loginButtonInSignUpModal = page.locator(
      'button.inline-flex.items-center.justify-center.text-xs.text-gray-500'
    )
    this.loginSubmitButton = page
      .locator('form')
      .getByRole('button', { name: 'Log In' })

    this.forgotIDPasswordButton = page.locator(
      'button.inline-flex.items-center.justify-center.rounded-md.font-medium.h-5.w-fit.p-0.py-2.text-xs.text-gray-500'
    )
    this.forgotIDPasswordModalCloseButton = page.locator(
      'button.absolute.left-4.top-4'
    )
    this.forgotEmailAddressSelector = page.locator('input.bg-white.text-sm')
    this.forgotFindUserIDButton = page.locator('button.bg-primary.text-gray-50')
    this.forgotResetPasswordButton = page.locator(
      'button.bg-gray-400.text-gray-50.h-10.px-4.py-2'
    )
    this.forgotRegisterNowButton = page.locator(
      'button.text-xs.text-gray-500.h-5.w-fit.p-0.py-2'
    )

    this.signUpButton = page.locator('button.bg-primary.text-gray-50.font-bold')
    this.signUpModal = page.locator(
      'div.flex.h-full.flex-col.items-center.justify-center'
    )
    this.signUpModalCloseButton = page.locator('button .lucide.lucide-x')
    this.signUpButtonInLoginModal = page.locator(
      'button.inline-flex.items-center.justify-center'
    )
    //not yet
    this.sendEmailButton = page.locator('button#signUp-with-email')
    this.signUpEmailAdressSelector = page.locator('input[name="Email Address"]')
    this.signUpVerificationCode = page.locator(
      'input[name="Verification Code"]'
    )
    this.signUpVerificationCodeNextButton = page.locator('button#next')
    this.signUpYourName = page.locator('input[name="Your name"]')
    this.signUpUserID = page.locator('input[name="User ID"]')
    this.signUpPassword = page.locator('input[name="Password"]')
    this.signUpReenterPassword = page.locator('input[name="Re-enter password"]')
    this.signUpRegisterButton = page.locator('button#signUpRegister')

    this.usernameSelector = page.locator('input[name="username"]')
    this.passwordSelector = page.locator('input[name="password"]')

    this.userProfile = page.locator('p.font-semibold.text-white')
    this.logoutButton = page.locator('button#logout')
    this.managementButton = page.locator('button#management')
  }
  async goToMain() {
    await this.page.goto('https://coolify.codedang.com/')
  }
  async clickLoginButton() {
    await this.loginButton.click()
  }

  async isLogInModalVisible(): Promise<boolean> {
    await this.loginModal.waitFor()
    return await this.loginModal.isVisible()
  }

  async isLoggedIn() {
    return await this.loginButton.isHidden()
  }

  async login(username: string, password: string) {
    await this.usernameSelector.fill(username)
    await this.passwordSelector.fill(password)
    await this.loginSubmitButton.click()
    await this.userProfile.waitFor() // appear when login success
  }

  async getJWTToken(): Promise<string | null> {
    const cookies = await this.page.context().cookies()
    const tokenCookie = cookies.find(
      (cookie) => cookie.name === '__Secure-next-auth.session-token'
    )
    return tokenCookie ? tokenCookie.value : null
  }

  async clickForgotIDPasswordButton() {
    await this.forgotIDPasswordButton.click()
  }

  async forgotIDPasswordModalVisible(): Promise<boolean> {
    return await this.signUpModal.isVisible()
  }

  async closeForgotIDPasswordModal() {
    if (await this.forgotIDPasswordModalVisible()) {
      await this.forgotIDPasswordModalCloseButton.click()
    }
  }

  async findUserID(emailAddress: string) {
    await this.forgotEmailAddressSelector.fill(emailAddress)
    await this.forgotFindUserIDButton.click()
    await this.forgotResetPasswordButton.click()
  }

  async registerNow() {
    await this.forgotRegisterNowButton.click()
  }

  async closeLoginModal() {
    if (await this.isLogInModalVisible()) {
      await this.loginModalCloseButton.click()
    }
  }

  async logout() {
    await this.logoutButton.click()
    await this.loginButton.waitFor()
  }

  async clickSignUpButton() {
    await this.signUpButton.click()
  }

  async signUp(emailAddress: string) {
    await this.signUpEmailAdressSelector.fill(emailAddress)
    await this.sendEmailButton.click()
  }

  async clickLoginButtonInSignUpModal() {
    await this.loginButtonInSignUpModal.click()
  }

  async closeSignUpModal() {
    if (await this.signUpModal.isVisible()) {
      await this.signUpModalCloseButton.click()
    }
  }
}
