import { Logger } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { createSandbox, type SinonStub } from 'sinon'
import { createPrismaPool } from './prisma-pool'
import { createPrismaFixture } from './prisma-test.fixture'
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

describe('PrismaTestService lifecycle', () => {
  const sandbox = createSandbox()
  let module: TestingModule
  let service: PrismaTestService
  let resources: ReturnType<typeof createPrismaPool>
  let createPool: SinonStub
  let connect: SinonStub
  let disconnect: SinonStub
  let expectedShutdownError: Error | undefined

  beforeEach(async () => {
    expectedShutdownError = undefined
    resources = createPrismaPool(
      'postgresql://localhost/prisma_unit_tests',
      '3',
      true
    )
    const fixture = await createPrismaFixture<PrismaTestService>(
      sandbox,
      './prisma.test.service',
      'PrismaTestService',
      resources
    )
    ;({ module, service, connect, disconnect, createPool } = fixture)
  })

  afterEach(async () => {
    try {
      await module.close().catch((error) => {
        expect(error).to.equal(expectedShutdownError)
      })
    } finally {
      sandbox.restore()
      if (!resources.pool.ended) await resources.pool.end()
    }
  })

  it('connects through the Nest startup hook and delegates pool disposal to the adapter', async () => {
    await module.init()

    expect(connect.calledOnce).to.equal(true)
    expect(
      createPool.calledOnceWithExactly(
        process.env.DATABASE_URL,
        process.env.DATABASE_CONNECTION_LIMIT,
        true
      )
    ).to.equal(true)
  })

  it('disconnects and rethrows the original connection failure', async () => {
    const failure = new Error('connection refused')
    expectedShutdownError = failure
    connect.rejects(failure)

    await expect(module.init()).to.be.rejectedWith(failure)

    expect(disconnect.calledOnce).to.equal(true)
  })

  it('logs idle pool errors', () => {
    const log = sandbox.stub(Logger.prototype, 'error')
    const failure = new Error('idle connection lost')

    resources.pool.emit('error', failure)

    expect(
      log.calledOnceWithExactly('PostgreSQL pool error', failure.stack)
    ).to.equal(true)
  })

  it('waits for adapter disconnection before completing shutdown', async () => {
    let finish!: () => void
    disconnect.returns(
      new Promise<void>((resolve) => {
        finish = resolve
      })
    )
    let completed = false

    const shutdown = service.onModuleDestroy().then(() => {
      completed = true
    })

    expect(disconnect.calledOnce).to.equal(true)
    expect(completed).to.equal(false)
    finish()
    await shutdown
    expect(completed).to.equal(true)
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
