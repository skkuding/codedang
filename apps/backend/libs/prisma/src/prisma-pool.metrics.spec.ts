import { expect } from 'chai'
import type { Pool } from 'pg'
import { createSandbox, spy } from 'sinon'
import { createMetricFixture } from './metric-test.fixture'
import { registerPoolMetrics } from './prisma-pool.metrics'

describe('Prisma pool OpenTelemetry metrics', () => {
  it('exports live pool state and removes the observation callback at shutdown', async () => {
    const sandbox = createSandbox()
    const { exporter, provider } = createMetricFixture(sandbox)
    const state = { totalCount: 3, idleCount: 1, waitingCount: 2 }
    const observedPool = {
      get totalCount() {
        return state.totalCount
      },
      get idleCount() {
        return state.idleCount
      },
      get waitingCount() {
        return state.waitingCount
      }
    }
    const reads = spy(observedPool, 'totalCount', ['get'])
    const stop = registerPoolMetrics(observedPool as Pool, 3)
    try {
      await provider.forceFlush()
      const instruments = exporter
        .getMetrics()[0]
        .scopeMetrics.flatMap((scope) => scope.metrics)
      const connections = instruments.find(
        (metric) => metric.descriptor.name === 'codedang.pg.pool.connections'
      )!
      expect(
        connections.dataPoints.map((point) => [
          point.attributes.state,
          point.value
        ])
      ).to.deep.equal([
        ['used', 2],
        ['idle', 1]
      ])
      expect(
        instruments.find((metric) =>
          metric.descriptor.name.endsWith('pending_requests')
        )!.dataPoints[0].value
      ).to.equal(2)
      expect(
        instruments.find((metric) =>
          metric.descriptor.name.endsWith('connection_limit')
        )!.dataPoints[0].value
      ).to.equal(3)

      state.idleCount = 3
      state.waitingCount = 0
      exporter.reset()
      await provider.forceFlush()
      const updated = exporter
        .getMetrics()[0]
        .scopeMetrics.flatMap((scope) => scope.metrics)
      expect(
        updated.find((metric) =>
          metric.descriptor.name.endsWith('connections')
        )!.dataPoints[0].value
      ).to.equal(0)

      stop()
      reads.get.resetHistory()
      // Cumulative exporters may retain the last values after callback removal.
      // Verify that collection no longer reads the pool after unregistering.
      await provider.forceFlush()
      expect(reads.get.called).to.equal(false)
    } finally {
      stop()
      sandbox.restore()
      await provider.shutdown()
    }
  })
})
