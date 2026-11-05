import { MailerService } from '@nestjs-modules/mailer'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)

  constructor(private readonly mailerService: MailerService) {}

  
  async sendEmailAuthenticationPin(email: string, pin: string) {
    const sentMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Authentication',
      template: 'email-auth',
      context: { pin }
    })
    this.logger.log(sentMessageInfo, 'sendEmailAuthenticationPin')
  }

  
  async sendUsername(email: string, username: string) {
    const sentMessageInfo = await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Your User ID',
      html: `<p>Your Codedang user ID is <b>${username}</b>.</p>`
    })
    this.logger.log(sentMessageInfo, 'sendUsername')
  }
}
