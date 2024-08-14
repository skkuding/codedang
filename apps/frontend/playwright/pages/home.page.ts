import type { Page, Locator } from '@playwright/test'

export class HomePage {
  public readonly homePageUrl: string = 'https://stage.codedang.com/'
  public readonly noticePageUrl: string = 'https://stage.codedang.com/notice'
  public readonly contestPageUrl: string = 'https://stage.codedang.com/contest'
  public readonly problemPageUrl: string = 'https://stage.codedang.com/problem'
  public readonly seeMorePageUrl: string = 'https://stage.codedang.com/problem'

  public readonly mainLogo: Locator
  public readonly noticeButton: Locator
  public readonly contestButton: Locator
  public readonly problemButton: Locator
  public readonly seemoreButton: Locator

  constructor(public page: Page) {
    this.mainLogo = page.locator('img[alt="코드당"]')
    this.noticeButton = page.locator('a[href="/notice"]')
    this.contestButton = page.locator('a[href="/contest"]')
    this.problemButton = page.locator('a[href="/problem"]')
    this.seemoreButton = page.locator('button:has-text("See More")')
  }

  async goTo() {
    await this.page.goto(this.homePageUrl)
  }

  async clickMainLogo(): Promise<void> {
    await this.mainLogo.click()
  }

  async clickNoticeButton(): Promise<void> {
    await this.noticeButton.click()
  }

  async clickContestButton(): Promise<void> {
    await this.contestButton.click()
  }

  async clickProblemButton(): Promise<void> {
    await this.problemButton.click()
  }

  async clickSeemoreButton(): Promise<void> {
    await this.seemoreButton.click()
  }

  async getCurrentUrl() {
    return await this.page.url()
  }

  async goToNoticePage() {
    await this.page.goto(this.noticePageUrl)
  }

  async goToContestPage() {
    await this.page.goto(this.contestPageUrl)
  }

  async goToProblemPage() {
    await this.page.goto(this.problemPageUrl)
  }

  async goToSeeMorePage() {
    await this.page.goto(this.seeMorePageUrl)
  }
}
