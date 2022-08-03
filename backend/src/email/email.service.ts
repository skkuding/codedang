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
      html: `<div>If you want to reset your password, Put the pin numbers below into the password reset page.</div>
      <h2>${pin}</h2>`
    })

    if (sentEmailInfo.accepted.length === 0) {
      throw new EmailTransmissionFailedException('Email transmission failed')
    }

    return sentEmailInfo
  }
}
