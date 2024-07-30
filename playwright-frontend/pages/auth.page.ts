import type { Page } from '@playwright/test'

export class Auth {
  public readonly page: Page
  public readonly loginButton = 'button#login'
  public readonly loginModal = '#login-modal'
  public readonly loginModalCloseButton = '#login-modal-close'
  public readonly loginButtonInSignupModal = 'button#login in signup'
  public readonly loginSubmitButton = 'button#loginSubmit'

  public readonly forgotIDPasswordButton = 'button#forgotIDPassword'
  public readonly forgotIDPasswordModal = '#forgotIDPassword-modal'
  public readonly forgotIDPasswordModalCloseButton =
    '#forgotIDPassword-modal-close'
  public readonly forgotEmailAddressSelector = 'input[name="Email Address"]'
  public readonly forgotFindUserIDButton = 'button#forgotFindUserID'
  public readonly forgotResetPasswordButton = 'button#forgotResetPassword'
  public readonly forgotRegisterNowButton = 'button#forgotRegisterNow'

  public readonly signupButton = 'button#signup'
  public readonly signupModal = '#signup-modal'
  public readonly signupModalCloseButton = '#signup-modal-close'
  public readonly signupButtonInLoginModal = 'button#signup in login'
  public readonly sendEmailButton = 'button#signup-with-email'
  public readonly signupEmailAdressSelector = 'input[name="Email Address"]'
  public readonly signupVerificationCode = 'input[name="Verification Code"]'
  public readonly signupVerificationCodeNextButton = 'button#next'
  public readonly signupYourName = 'input[name="Your name"]'
  public readonly signupUserID = 'input[name="User ID"]'
  public readonly signupPassword = 'input[name="Password"]'
  public readonly signupReenterPassword = 'input[name="Re-enter password"]'
  public readonly signupRegisterButton = 'button#signupRegister'

  public readonly usernameSelector = 'input[name="username"]'
  public readonly passwordSelector = 'input[name="password]'

  public readonly userProfile = 'user-profile'
  public readonly logoutButton = 'button#logout'
  public readonly managementButton = 'button#management'

  constructor(page: Page) {
    this.page = page
  }

  async clickLoginButton() {
    await this.page.click(this.loginButton)
  }

  async loginModalVisible() {
    return await this.page.isVisible(this.loginModal)
  }

  async login(username: string, password: string) {
    await this.page.fill(this.usernameSelector, username)
    await this.page.fill(this.passwordSelector, password)
    await this.page.click(this.loginSubmitButton)
  }

  async submitLoginButton() {
    await this.page.click(this.loginSubmitButton)
  }

  async clickSignupButtonInLoginModal() {
    await this.page.click(this.signupButtonInLoginModal)
  }

  async clickForgotIDPasswordButton() {
    await this.page.click(this.forgotIDPasswordButton)
  }

  async forgotIDPasswordModalVisible() {
    return await this.page.isVisible(this.forgotIDPasswordModal)
  }

  async closeForgotIDPsswordModal() {
    if (await this.forgotIDPasswordModalVisible()) {
      await this.page.click(this.forgotIDPasswordModalCloseButton)
    }
  }

  async findUserID(emailAddress: string) {
    await this.page.fill(this.forgotEmailAddressSelector, emailAddress)
    await this.page.click(this.forgotFindUserIDButton)
    await this.page.click(this.forgotResetPasswordButton)
  }

  async registerNow() {
    await this.page.click(this.forgotRegisterNowButton)
  }

  async closeLoginModal() {
    if (await this.loginModalVisible()) {
      await this.page.click(this.loginModalCloseButton)
    }
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.isVisible(this.userProfile)
  }

  async logout() {
    await this.page.click(this.logoutButton)
  }

  async isLoggedOut(): Promise<boolean> {
    return this.page.isVisible(this.loginModal)
  }

  async clickSignupButton() {
    await this.page.click(this.signupButton)
  }

  async signupModalVisible() {
    return await this.page.isVisible(this.signupModal)
  }

  async signUp(emailAddress: string) {
    await this.page.fill(this.signupEmailAdressSelector, emailAddress)
    await this.page.click(this.sendEmailButton)
  }

  async clickLoginButtonInSignupModal() {
    await this.page.click(this.loginButtonInSignupModal)
  }

  async closeSignupModal() {
    if (await this.signupModalVisible) {
      await this.page.click(this.signupModalCloseButton)
    }
  }
}
