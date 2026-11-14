import { Logger } from '@nestjs/common'
import type { TestingModule } from '@nestjs/testing'
import { expect } from 'chai'
import { createSandbox, type SinonStub } from 'sinon'
import { createPrismaPool } from './prisma-pool'
import { createPrismaFixture } from './prisma-test.fixture'
import type { PrismaService } from './prisma.service'

describe('PrismaService lifecycle', () => {
  const sandbox = createSandbox()
  let module: TestingModule
  let service: PrismaService
  let resources: ReturnType<typeof createPrismaPool>
  let connect: SinonStub
  let disconnect: SinonStub
  let end: SinonStub
  let expectedShutdownError: Error | undefined

  beforeEach(async () => {
    expectedShutdownError = undefined
    resources = createPrismaPool(
      'postgresql://localhost/prisma_unit_tests',
      '3'
    )
    const fixture = await createPrismaFixture<PrismaService>(
      sandbox,
      './prisma.service',
      'PrismaService',
      resources
    )
    ;({ module, service, connect, disconnect } = fixture)
    end = sandbox.stub(resources.pool, 'end').callThrough()
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

  it('connects through the Nest startup hook and forwards Prisma log events', async () => {
    const on = sandbox.stub()
    service.$on = on
    const logger = {
      error: sandbox.stub(Logger.prototype, 'error'),
      warn: sandbox.stub(Logger.prototype, 'warn'),
      log: sandbox.stub(Logger.prototype, 'log'),
      debug: sandbox.stub(Logger.prototype, 'debug')
    }

    await module.init()

    expect(connect.calledOnce).to.equal(true)
    for (const [level, method] of [
      ['error', 'error'],
      ['warn', 'warn'],
      ['info', 'log'],
      ['query', 'debug']
    ] as const) {
      const callback = on.getCalls().find((call) => call.args[0] === level)!
        .args[1] as (event: unknown) => void
      const event = { message: `${level} event` }
      callback(event)
      expect(logger[method].calledWith(event)).to.equal(true)
    }
  })

  it('closes the pool and rethrows the original connection failure', async () => {
    const failure = new Error('connection refused')
    expectedShutdownError = failure
    connect.rejects(failure)

    await expect(module.init()).to.be.rejectedWith(failure)

    expect(disconnect.calledOnce).to.equal(true)
    expect(end.calledOnce).to.equal(true)
    expect(resources.pool.ended).to.equal(true)
    expect(resources.pool.listenerCount('error')).to.equal(0)
  })

  it('logs an idle pool error without throwing it as an unhandled event', () => {
    const log = sandbox.stub(Logger.prototype, 'error')
    const failure = new Error('idle connection lost')

    resources.pool.emit('error', failure)

    expect(
      log.calledOnceWithExactly('PostgreSQL pool error', failure.stack)
    ).to.equal(true)
  })

  it('closes the pool only once during concurrent and repeated shutdown', async () => {
    await module.init()

    const first = service.onModuleDestroy()
    const second = service.onModuleDestroy()
    expect(second).to.equal(first)
    await Promise.all([first, second])
    await service.onModuleDestroy()

    expect(disconnect.calledOnce).to.equal(true)
    expect(end.calledOnce).to.equal(true)
    expect(resources.pool.ended).to.equal(true)
    expect(resources.pool.listenerCount('error')).to.equal(0)
  })

  it('still closes the pool and removes its error listener if disconnect fails', async () => {
    expectedShutdownError = new Error('disconnect failed')
    disconnect.rejects(expectedShutdownError)

    await expect(service.onModuleDestroy()).to.be.rejectedWith(
      expectedShutdownError
    )

    expect(end.calledOnce).to.equal(true)
    expect(resources.pool.ended).to.equal(true)
    expect(resources.pool.listenerCount('error')).to.equal(0)
  })

  it('removes its error listener even if ending the pool fails', async () => {
    expectedShutdownError = new Error('pool shutdown failed')
    end.rejects(expectedShutdownError)

    await expect(service.onModuleDestroy()).to.be.rejectedWith(
      expectedShutdownError
    )

    expect(disconnect.calledOnce).to.equal(true)
    expect(resources.pool.listenerCount('error')).to.equal(0)
  })
})
