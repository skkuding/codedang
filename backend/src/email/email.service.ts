import * as path from 'path'
import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { SentMessageInfo } from 'nodemailer'
import { EmailTransmissionFailedException } from 'src/common/exception/business.exception'

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetPin(
    email: string,
    pin: string
  ): Promise<SentMessageInfo> {
    const sentEmailInfo = await this.mailerService.sendMail({
      to: email,
      subject: `Reset your password`,
      template: path.join(__dirname, 'templates/reset-password'),
      context: { pin },
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
