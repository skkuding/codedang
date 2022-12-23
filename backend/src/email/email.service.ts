import * as path from 'path'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { SentMessageInfo } from 'nodemailer'
import { EmailTransmissionFailedException } from 'src/common/exception/business.exception'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmailAuthenticationPin(
    email: string,
    pin: string
  ): Promise<SentMessageInfo> {
    const sentEmailInfo = await this.mailerService.sendMail({
      to: email,
      subject: `SKKU Coding Platform Email Authentication`,
      html: `<div>If you want to authenticate your email, Put the pin numbers.</div>
      <h2>${pin}</h2>`,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, 'templates/logo.png'),
          cid: 'logo'
        }
      ]
    })

    if (sentEmailInfo.accepted.length === 0) {
      throw new EmailTransmissionFailedException()
    }

    return sentEmailInfo
  }
}
