import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly mailerService: MailerService) {}

  /**
   * 생성된 pin번호를 입력된 이메일 주소로 메일을 전송하고, 로그를 기록합니다.
   *
   * @param {string} email 이메일 주소
   * @param {number} pin pin번호
   */
  async sendEmailAuthenticationPin(email: string, pin: string) {
    const sentMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Authentication',
      template: 'email-auth',
      context: { pin }
    })
    this.logger.log(sentMessageInfo, 'sendEmailAuthenticationPin')
  }

  /**
   * 이메일 주소로 가입된 사용자 아이디를 전송하고, 로그를 기록합니다.
   *
   * @param {string} email 이메일 주소
   * @param {string} username 사용자 아이디
   */
  async sendUsername(email: string, username: string) {
    const sentMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Your User ID',
      html: `<p>Your Codedang user ID is <b>${username}</b>.</p>`
    })
    this.logger.log(sentMessageInfo, 'sendUsername')
  }
}
