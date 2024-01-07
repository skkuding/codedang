import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

type Paginate = { skip?: number; cursor?: { id: number } }

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
  getPaginator(cursor: number | null): Paginate {
    if (cursor == null) {
      return {}
    }
    return {
      skip: 1,
      cursor: {
        id: cursor
      }
    }
  }
}
