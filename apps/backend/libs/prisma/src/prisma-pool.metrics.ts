import { metrics, type BatchObservableCallback } from '@opentelemetry/api'
import type { Pool } from 'pg'

export const registerPoolMetrics = (pool: Pool, max: number): (() => void) => {
  const meter = metrics.getMeter('codedang.prisma.pool', '1.0.0')
  const connections = meter.createObservableGauge(
    'codedang.pg.pool.connections',
    {
      description: 'Current checked-out and idle PostgreSQL pool connections',
      unit: '{connection}'
    }
  )
  const pending = meter.createObservableGauge(
    'codedang.pg.pool.pending_requests',
    {
      description: 'Requests waiting to acquire a PostgreSQL pool connection',
      unit: '{request}'
    }
  )
  const limit = meter.createObservableGauge(
    'codedang.pg.pool.connection_limit',
    {
      description: 'Configured maximum PostgreSQL pool connections',
      unit: '{connection}'
    }
  )
  const collect: BatchObservableCallback = (result) => {
    const total = pool.totalCount
    const idle = pool.idleCount
    const attributes = { pool: 'primary' }
    result.observe(connections, total - idle, { ...attributes, state: 'used' })
    result.observe(connections, idle, { ...attributes, state: 'idle' })
    result.observe(pending, pool.waitingCount, attributes)
    result.observe(limit, max, attributes)
  }
  const instruments = [connections, pending, limit]
  meter.addBatchObservableCallback(collect, instruments)
  return () => meter.removeBatchObservableCallback(collect, instruments)
}
