import type {
  MailerOptions,
  MailerOptionsFactory
} from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailerConfigService implements MailerOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createMailerOptions(): MailerOptions | Promise<MailerOptions> {
    return {
      transport: {
        host: 'mail.skkuding.dev',
        auth: {
          user: this.config.get('NODEMAILER_USER'),
          pass: this.config.get('NODEMAILER_PASS')
        }
      },
      defaults: {
        from: this.config.get('NODEMAILER_USER')
      },
      template: {
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
    }
  }
}
