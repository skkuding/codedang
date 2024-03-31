import { Prisma } from '@prisma/client'
import { PrismaService } from './prisma.service'

export type FlatTransactionClient = Prisma.TransactionClient & {
  $commit: () => Promise<void>
  $rollback: () => Promise<void>
}

const ROLLBACK = { [Symbol.for('prisma.client.extension.rollback')]: true }

export const transactionExtension = Prisma.defineExtension({
  client: {
    async $begin() {
      const prisma = Prisma.getExtensionContext(this)
      let setTxClient: (txClient: Prisma.TransactionClient) => void
      let commit: () => void
      let rollback: () => void

      // a promise for getting the tx inner client
      const txClient = new Promise<Prisma.TransactionClient>((res) => {
        setTxClient = res
      })

      // a promise for controlling the transaction
      const txPromise = new Promise((_res, _rej) => {
        commit = () => _res(undefined)
        rollback = () => _rej(ROLLBACK)
      })

      // opening a transaction to control externally
      if (
        '$transaction' in prisma &&
        typeof prisma.$transaction === 'function'
      ) {
        const tx = prisma
          .$transaction((txClient) => {
            setTxClient(txClient as unknown as Prisma.TransactionClient)
            return txPromise
          })
          .catch((e) => {
            if (e === ROLLBACK) {
              return
            }
            throw e
          })

        // return a proxy TransactionClient with `$commit` and `$rollback` methods
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
            return target[prop as keyof typeof target]
          }
        }) as FlatTransactionClient
      }

      throw new Error('Transactions are not supported by this client')
    },
    getPaginator: PrismaService.prototype.getPaginator
  }
})
