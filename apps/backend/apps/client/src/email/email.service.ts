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
}
