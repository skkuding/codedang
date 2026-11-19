import { expect } from 'chai'
import { PrismaTestService } from './prisma.test.service'

// Exercise the transaction wrapper without requiring a database connection.
describe('PrismaTestService transaction wrapper', () => {
  it('rejects when acquiring a transaction fails before the callback runs', async () => {
    const failure = new Error('connection acquisition timed out')
    const service = {
      $transaction: () => Promise.reject(failure)
    } as unknown as PrismaTestService
    try {
      await PrismaTestService.prototype.$begin.call(service)
      expect.fail('Expected transaction acquisition to reject')
    } catch (error) {
      expect(error).to.equal(failure)
    }
  })

  it('resolves batch queries and waits for commit completion', async () => {
    const service = {
      $transaction: (callback: (client: object) => Promise<unknown>) =>
        callback({})
    } as unknown as PrismaTestService
    const transaction = await PrismaTestService.prototype.$begin.call(service)
    const batch = transaction as unknown as {
      $transaction: (queries: Promise<number>[]) => Promise<number[]>
    }
    expect(await batch.$transaction([Promise.resolve(42)])).to.deep.equal([42])
    await transaction.$commit()
  })

  it('swallows only its own rollback sentinel', async () => {
    const service = {
      $transaction: (callback: (client: object) => Promise<unknown>) =>
        callback({})
    } as unknown as PrismaTestService
    const transaction = await PrismaTestService.prototype.$begin.call(service)
    await transaction.$rollback()
  })
})

describe('PrismaTestService transaction inputs', () => {
  it('rejects if the transaction ends before supplying a client', async () => {
    const service = {
      $transaction: () => Promise.resolve()
    } as unknown as PrismaTestService

    await expect(
      PrismaTestService.prototype.$begin.call(service)
    ).to.be.rejectedWith('Transaction ended before providing a client')
  })

  it('runs callbacks and batch functions against the same transaction client', async () => {
    const client = { value: 42 }
    const service = {
      $transaction: (callback: (client: object) => Promise<unknown>) =>
        callback(client)
    } as unknown as PrismaTestService
    const transaction = await PrismaTestService.prototype.$begin.call(service)
    const batch = transaction as unknown as {
      $transaction: (input: unknown) => Promise<unknown>
    }
    const callback = async (target: object) => {
      expect(target).to.equal(client)
      return client.value
    }
    try {
      expect(
        await batch.$transaction([callback, Promise.resolve(7)])
      ).to.deep.equal([42, 7])
      expect(await batch.$transaction(callback)).to.equal(42)
      await expect(batch.$transaction(null)).to.be.rejectedWith(
        'Invalid transaction input'
      )
    } finally {
      await transaction.$rollback()
    }
  })
})
