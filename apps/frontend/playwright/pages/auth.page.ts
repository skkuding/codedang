import type { Page, Locator } from '@playwright/test'

export class Auth {
  public readonly page: Page
  public readonly loginButton: Locator
  public readonly loginModal: Locator
  public readonly loginModalCloseButton: Locator
  public readonly loginButtonInSignupModal: Locator
  public readonly loginSubmitButton: Locator

  public readonly forgotIDPasswordButton: Locator
  public readonly forgotIDPasswordModal: Locator
  public readonly forgotIDPasswordModalCloseButton: Locator
  public readonly forgotEmailAddressSelector: Locator
  public readonly forgotFindUserIDButton: Locator
  public readonly forgotResetPasswordButton: Locator
  public readonly forgotRegisterNowButton: Locator

  public readonly signupButton: Locator
  public readonly signupModal: Locator
  public readonly signupModalCloseButton: Locator
  public readonly signupButtonInLoginModal: Locator
  public readonly sendEmailButton: Locator
  public readonly signupEmailAdressSelector: Locator
  public readonly signupVerificationCode: Locator
  public readonly signupVerificationCodeNextButton: Locator
  public readonly signupYourName: Locator
  public readonly signupUserID: Locator
  public readonly signupPassword: Locator
  public readonly signupReenterPassword: Locator
  public readonly signupRegisterButton: Locator

  public readonly usernameSelector: Locator
  public readonly passwordSelector: Locator

  public readonly userProfile: Locator
  public readonly logoutButton: Locator
  public readonly managementButton: Locator

  constructor(page: Page) {
    this.page = page
    this.loginButton = page.locator(
      'button.md\\:block.text-primary.h-10.px-3.py-1'
    )

    this.loginModal = page.locator(
      'div.flex.h-full.w-full.flex-col.justify-between'
    )
    this.loginModalCloseButton = page.locator('svg.lucide.lucide-x.h-4.w-4')
    this.loginButtonInSignupModal = page.locator(
      'button.inline-flex.items-center.justify-center.text-xs.text-gray-500'
    )
    this.loginSubmitButton = page.locator(
      'form button.bg-primary.text-gray-50[type="submit"]'
    )

    this.forgotIDPasswordButton = page.locator(
      'button.inline-flex.items-center.justify-center.rounded-md.font-medium.h-5.w-fit.p-0.py-2.text-xs.text-gray-500'
    )
    this.forgotIDPasswordModal = page.locator(
      'div.flex.h-full.flex-col.items-center.justify-center'
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

    this.signupButton = page.locator('button.bg-primary.text-gray-50.font-bold')
    this.signupModal = page.locator(
      'div.flex.h-full.flex-col.items-center.justify-center'
    )
    this.signupModalCloseButton = page.locator('button .lucide.lucide-x')
    this.signupButtonInLoginModal = page.locator(
      'button.inline-flex.items-center.justify-center'
    )
    //not yet
    this.sendEmailButton = page.locator('button#signup-with-email')
    this.signupEmailAdressSelector = page.locator('input[name="Email Address"]')
    this.signupVerificationCode = page.locator(
      'input[name="Verification Code"]'
    )
    this.signupVerificationCodeNextButton = page.locator('button#next')
    this.signupYourName = page.locator('input[name="Your name"]')
    this.signupUserID = page.locator('input[name="User ID"]')
    this.signupPassword = page.locator('input[name="Password"]')
    this.signupReenterPassword = page.locator('input[name="Re-enter password"]')
    this.signupRegisterButton = page.locator('button#signupRegister')

    this.usernameSelector = page.locator('input[name="username"]')
    this.passwordSelector = page.locator('input[name="password"]')

    this.userProfile = page.locator('svg.h-6.w-6.text-white')
    this.logoutButton = page.locator('button#logout')
    this.managementButton = page.locator('button#management')
  }

  async clickLoginButton() {
    await this.loginButton.click()
  }

  async loginModalVisible(): Promise<boolean> {
    await this.page.waitForSelector(
      'div.flex.h-full.w-full.flex-col.justify-between',
      { state: 'visible' }
    )
    return await this.loginModal.isVisible()
  }

  async login(username: string, password: string) {
    await this.usernameSelector.fill(username)
    await this.passwordSelector.fill(password)
    await this.loginSubmitButton.click()
  }

  async getJWTToken(): Promise<string | null> {
    const cookies = await this.page.context().cookies()
    const tokenCookie = cookies.find(
      (cookie) => cookie.name === '__Secure-next-auth.session-token'
    )
    return tokenCookie ? tokenCookie.value : null
  }

  async submitLoginButton() {
    await this.loginSubmitButton.click()
  }

  async clickSignupButtonInLoginModal() {
    await this.signupButtonInLoginModal.click()
  }

  async clickForgotIDPasswordButton() {
    await this.forgotIDPasswordButton.click()
  }

  async forgotIDPasswordModalVisible(): Promise<boolean> {
    return await this.forgotIDPasswordModal.isVisible()
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
    if (await this.loginModalVisible()) {
      await this.loginModalCloseButton.click()
    }
  }

  async logout() {
    await this.logoutButton.click()
  }

  async clickSignupButton() {
    await this.signupButton.click()
  }

  async signupModalVisible(): Promise<boolean> {
    return await this.signupModal.isVisible()
  }

  async signUp(emailAddress: string) {
    await this.signupEmailAdressSelector.fill(emailAddress)
    await this.sendEmailButton.click()
  }

  async clickLoginButtonInSignupModal() {
    await this.loginButtonInSignupModal.click()
  }

  async closeSignupModal() {
    if (await this.signupModalVisible()) {
      await this.signupModalCloseButton.click()
    }
  }
}
