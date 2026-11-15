import {
  Injectable,
  Logger,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common'
import { PrismaClient, type Prisma } from '@prisma/client'
import { createPrismaPool, observePoolErrors } from './prisma-pool'
import type { Paginator } from './prisma.service'

export type FlatTransactionClient = Prisma.TransactionClient & {
  $commit: () => Promise<void>
  $rollback: () => Promise<void>
}

const ROLLBACK = { [Symbol.for('prisma.client.extension.rollback')]: true }

@Injectable()
export class PrismaTestService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const { pool, adapter } = createPrismaPool(
      process.env.DATABASE_URL,
      process.env.DATABASE_CONNECTION_LIMIT,
      true
    )
    super({ adapter })
    const logger = new Logger(PrismaTestService.name)
    observePoolErrors(pool, logger)
  }

  async onModuleInit() {
    try {
      await this.$connect()
    } catch (error) {
      await this.$disconnect()
      throw error
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
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

  async $begin() {
    let setTxClient: (txClient: Prisma.TransactionClient) => void
    let commit: () => void
    let rollback: () => void

    const txClient = new Promise<Prisma.TransactionClient>((res) => {
      setTxClient = (txClient) => res(txClient)
    })

    const txPromise = new Promise((_res, _rej) => {
      commit = () => _res(undefined)
      rollback = () => _rej(ROLLBACK)
    })

    const tx = this.$transaction((txClient) => {
      setTxClient(txClient as unknown as Prisma.TransactionClient)

      return txPromise
    }).catch((e) => {
      if (e === ROLLBACK) return
      throw e
    })

    // Acquisition can fail before the transaction callback runs. Propagate that
    // failure instead of leaving callers waiting forever for txClient.
    const startedClient = await Promise.race([
      txClient,
      tx.then(() => {
        throw new Error('Transaction ended before providing a client')
      })
    ])

    return new Proxy(startedClient, {
      get(target, prop) {
        if (prop === '$commit') {
          return () => {
            commit()
            return tx
          }
        }
        if (prop === '$rollback') {
          return () => {
            rollback()
            return tx
          }
        }
        if (prop === '$transaction') {
          return async (input: unknown) => {
            if (Array.isArray(input)) {
              const results: unknown[] = []
              for (const query of input) {
                if (typeof query === 'function') {
                  results.push(await query(target))
                } else {
                  results.push(await query)
                }
              }
              return results
            } else if (typeof input === 'function') {
              return input(target)
            }
            throw new Error('Invalid transaction input')
          }
        }
        return target[prop as keyof typeof target]
      }
    }) as FlatTransactionClient
  }
}
