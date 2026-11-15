import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'
import type { Pool } from 'pg'
import { createPrismaPool, observePoolErrors } from './prisma-pool'
import { registerPoolMetrics } from './prisma-pool.metrics'

export type Paginator<T> = {
  skip?: number
  cursor?: T extends number ? { id: number } : T
}

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions & {
      log: { emit: 'event'; level: Prisma.LogLevel }[]
    }
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)
  private readonly pgPool: Pool
  private readonly maxConnections: number
  private stopPoolMetrics?: () => void
  private cleanupPromise?: Promise<void>
  private readonly stopPoolErrors: () => void

  constructor(config: ConfigService) {
    const { pool, adapter, max } = createPrismaPool(
      config.get<string>('DATABASE_URL'),
      config.get<string>('DATABASE_CONNECTION_LIMIT')
    )

    super({
      adapter,
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
    this.pgPool = pool
    this.maxConnections = max
    this.stopPoolErrors = observePoolErrors(pool, this.logger)
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

    try {
      await this.$connect()
      this.stopPoolMetrics?.()
      this.stopPoolMetrics = registerPoolMetrics(
        this.pgPool,
        this.maxConnections
      )
    } catch (error) {
      await this.onModuleDestroy()
      throw error
    }
  }

  onModuleDestroy() {
    return (this.cleanupPromise ??= this.closePool())
  }

  private async closePool() {
    this.stopPoolMetrics?.()
    this.stopPoolMetrics = undefined
    try {
      await this.$disconnect()
    } finally {
      try {
        await this.pgPool.end()
      } finally {
        this.stopPoolErrors()
      }
    }
  }

  // Use explicit type to avoid Prisma query argument type error
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
