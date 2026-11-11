import type { TestingModule } from '@nestjs/testing'
import type {
  InMemoryMetricExporter,
  MeterProvider
} from '@opentelemetry/sdk-metrics'
import { expect } from 'chai'
import { createSandbox, type SinonSpy, type SinonStub } from 'sinon'
import { createMetricFixture } from './metric-test.fixture'
import { createPrismaPool } from './prisma-pool'
import { registerPoolMetrics } from './prisma-pool.metrics'
import { createPrismaFixture } from './prisma-test.fixture'
import type { PrismaService } from './prisma.service'

describe('PrismaService pool telemetry lifecycle', () => {
  const sandbox = createSandbox()
  let module: TestingModule
  let service: PrismaService
  let resources: ReturnType<typeof createPrismaPool>
  let exporter: InMemoryMetricExporter
  let provider: MeterProvider
  let register: SinonStub
  let connect: SinonStub
  let disconnect: SinonStub
  let stops: SinonSpy[]
  let expectedShutdownError: Error | undefined

  beforeEach(async () => {
    stops = []
    expectedShutdownError = undefined
    resources = createPrismaPool(
      'postgresql://localhost/prisma_unit_tests',
      '3'
    )
    ;({ exporter, provider } = createMetricFixture(sandbox))
    register = sandbox.stub().callsFake((pool, max) => {
      const stop = sandbox.spy(registerPoolMetrics(pool, max))
      stops.push(stop)
      return stop
    })
    const overrides: Record<string, unknown> = {}
    overrides['./prisma-pool.metrics'] = { registerPoolMetrics: register }
    const fixture = await createPrismaFixture<PrismaService>(
      sandbox,
      './prisma.service',
      'PrismaService',
      resources,
      overrides
    )
    ;({ module, service, connect, disconnect } = fixture)
  })

  afterEach(async () => {
    try {
      await module.close().catch((error) => {
        expect(error).to.equal(expectedShutdownError)
      })
    } finally {
      stops.forEach((stop) => stop())
      sandbox.restore()
      await provider.shutdown()
      if (!resources.pool.ended) await resources.pool.end()
    }
  })

  it('registers telemetry for the adapter pool only after connecting', async () => {
    await module.init()

    expect(connect.calledBefore(register)).to.equal(true)
    expect(register.calledOnceWithExactly(resources.pool, 3)).to.equal(true)
    await provider.forceFlush()
    const instruments = exporter
      .getMetrics()[0]
      .scopeMetrics.flatMap((scope) => scope.metrics)
    const limit = instruments.find(
      (metric) => metric.descriptor.name === 'codedang.pg.pool.connection_limit'
    )!
    expect(limit.dataPoints[0].value).to.equal(3)
    expect(limit.dataPoints[0].attributes).to.deep.equal({ pool: 'primary' })
  })

  it('removes observations before disconnecting and closes telemetry only once', async () => {
    await module.init()
    const reads = sandbox.spy(resources.pool, 'totalCount', ['get'])
    await provider.forceFlush()
    expect(reads.get.calledOnce).to.equal(true)
    reads.get.resetHistory()
    disconnect.callsFake(async () => {
      await provider.forceFlush()
      expect(reads.get.called).to.equal(false)
    })

    await Promise.all([service.onModuleDestroy(), service.onModuleDestroy()])

    expect(stops[0].calledOnce).to.equal(true)
    expect(disconnect.calledOnce).to.equal(true)
    expect(resources.pool.ended).to.equal(true)
  })

  it('replaces a previous observation callback when initialized again', async () => {
    await module.init()
    await service.onModuleInit()

    expect(register.calledTwice).to.equal(true)
    expect(stops[0].calledOnce).to.equal(true)
    expect(stops[1].called).to.equal(false)
    const reads = sandbox.spy(resources.pool, 'totalCount', ['get'])
    await provider.forceFlush()
    expect(reads.get.calledOnce).to.equal(true)

    await service.onModuleDestroy()
    expect(stops[1].calledOnce).to.equal(true)
  })

  it('does not register observations if connecting fails', async () => {
    expectedShutdownError = new Error('connection refused')
    connect.rejects(expectedShutdownError)

    await expect(module.init()).to.be.rejectedWith(expectedShutdownError)

    expect(register.called).to.equal(false)
    expect(resources.pool.ended).to.equal(true)
  })

  it('removes observations even if Prisma disconnection fails', async () => {
    await module.init()
    expectedShutdownError = new Error('disconnect failed')
    disconnect.rejects(expectedShutdownError)
    const reads = sandbox.spy(resources.pool, 'totalCount', ['get'])

    await expect(service.onModuleDestroy()).to.be.rejectedWith(
      expectedShutdownError
    )
    await provider.forceFlush()

    expect(stops[0].calledOnce).to.equal(true)
    expect(reads.get.called).to.equal(false)
    expect(resources.pool.ended).to.equal(true)
  })
})
