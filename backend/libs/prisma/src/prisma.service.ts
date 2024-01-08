import type { OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, Prisma.LogLevel>
  implements OnModuleInit
{
  private readonly logger = new Logger(PrismaService.name)
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL')
        }
      },
      log: [
        {
          emit: 'event',
          level: 'query'
        },
        {
          emit: 'event',
          level: 'error'
        },
        {
          emit: 'event',
          level: 'info'
        },
        {
          emit: 'event',
          level: 'warn'
        }
      ]
    })
  }

  async onModuleInit() {
    this.$on('error', (event) => {
      this.logger.error(event)
    })
    this.$on('warn', (event) => {
      this.logger.warn(event)
    })
    this.$on('info', (event) => {
      this.logger.log(event)
    })
    this.$on('query', (event) => {
      this.logger.debug(event, 'SQL Query')
    })

    await this.$connect()
  }
}
