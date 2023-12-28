import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailAuthenticationPin(email: string, pin: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Authentication',
      template: 'email-auth',
      context: { pin }
    })
  }
}
