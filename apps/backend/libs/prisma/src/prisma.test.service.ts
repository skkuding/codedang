import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

type Paginator<T> = {
  skip?: number
  cursor?: T extends number ? { id: number } : T
}

@Injectable()
export class PrismaTestService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL
        }
      }
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async startTransaction() {
    await this.$executeRaw`BEGIN`
  }

  async rollbackTransaction() {
    await this.$executeRaw`ROLLBACK`
  }
  getPaginator(cursor: number | null): Paginator<number>

  getPaginator<T>(
    cursor: number | null,
    transform: (arg: number) => T
  ): Paginator<T>

  getPaginator<T>(cursor: number | null, transform?: (arg: number) => T) {
    if (cursor == null) {
      return {}
    }
    if (transform) {
      return {
        skip: 1,
        cursor: transform(cursor)
      }
    }
    return {
      skip: 1,
      cursor: {
        id: cursor
      }
    }
  }
}
