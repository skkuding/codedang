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

  createMailerOptions(): MailerOptions {
    return {
      transport: {
        host: this.config.get('NODEMAILER_HOST'),
        auth: {
          user: this.config.get('NODEMAILER_USER'),
          pass: this.config.get('NODEMAILER_PASS')
        }
      },
      defaults: {
        from: this.config.get('NODEMAILER_FROM')
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
