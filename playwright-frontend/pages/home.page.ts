import type { Page } from '@playwright/test'

export class HomePage {
  //homepage URLs
  public readonly homePageUrl = 'https://stage.codedang.com/'
  public readonly noticePageUrl = 'https://stage.codedang.com/notice'
  public readonly contestPageUrl = 'https://stage.codedang.com/contest'
  public readonly problemPageUrl = 'https://stage.codedang.com/problem'
  public readonly seeMorePageUrl = 'https://stage.codedang.com/problem'

  //buttons
  public readonly mainLogo = '#main-logo'
  public readonly noticeButton = 'button#notice'
  public readonly contestButton = 'button#contest'
  public readonly problemButton = 'button#problem'
  public readonly seemoreButton = 'button#seemore'

  //3 banners and footer not included yet

  constructor(public page: Page) {}

  async goTo() {
    await this.page.goto(this.homePageUrl)
  }
  //click button
  async clickMainLogo() {
    await this.page.click(this.mainLogo)
  }

  async clickNoticeButton() {
    await this.page.click(this.noticeButton)
  }

  async clickContestButton() {
    await this.page.click(this.contestButton)
  }

  async clickProblemButton() {
    await this.page.click(this.problemButton)
  }

  async clickSeemoreButton() {
    await this.page.click(this.seemoreButton)
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
