import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit
} from '@nestjs/common'
import { PrismaClient, type Prisma } from '@prisma/client'
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
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
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

    return new Proxy(await txClient, {
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
          return async (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            fn: (client: Prisma.TransactionClient) => Promise<any>
          ) => {
            return fn(target)
          }
        }
        return target[prop as keyof typeof target]
      }
    }) as FlatTransactionClient
  }
}
