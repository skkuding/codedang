import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import * as path from 'path'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailAuthenticationPin(email: string, pin: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '[Codedang] Authentication',
      template: path.join(__dirname, 'email/templates/email-auth'),
      context: { pin },
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, 'email/templates/logo.png'),
          cid: 'logo'
        }
      ]
    })
  }
}
