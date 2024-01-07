import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

type Paginator<T> = {
  skip?: number
  cursor?: T extends number ? { id: number } : T
}

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get('DATABASE_URL')
        }
      }
    })
  }

  // Use explicit type to avoid Prisma query argument type error
  getPaginator(cursor: number | null): Paginator<number>
  getPaginator<T>(
    cursor: number | null,
    customCursor: (number) => T
  ): Paginator<T>

  getPaginator<T>(cursor: number | null, customCursor?: (arg: number) => T) {
    if (cursor == null) {
      return {}
    }
    if (customCursor) {
      return {
        skip: 1,
        cursor: customCursor(cursor)
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
