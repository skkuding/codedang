import { expect } from 'chai'
import { createPrismaPool, observePoolErrors } from './prisma-pool'

describe('Prisma pool configuration', () => {
  it('validates required connection settings before opening a connection', () => {
    expect(() => createPrismaPool(undefined)).to.throw(
      'DATABASE_URL is required'
    )
    for (const limit of [
      '',
      '0',
      '-1',
      '1.5',
      'NaN',
      'Infinity',
      '9007199254740992'
    ]) {
      expect(() =>
        createPrismaPool('postgresql://localhost/test', limit)
      ).to.throw('DATABASE_CONNECTION_LIMIT must be a positive safe integer')
    }
  })

  it('defaults to the public schema and ten connections without an override', async () => {
    const { pool, adapter, max } = createPrismaPool(
      'postgresql://localhost/test'
    )
    try {
      expect(max).to.equal(10)
      expect(pool.options.max).to.equal(10)
      const driver = await adapter.connect()
      expect(driver.getConnectionInfo?.().schemaName).to.equal('public')
      await driver.dispose()
      expect(pool.ended).to.equal(false)
    } finally {
      await pool.end()
    }
  })

  it('disposes the pool when its ownership is delegated to the test adapter', async () => {
    const { pool, adapter } = createPrismaPool(
      'postgresql://localhost/test',
      undefined,
      true
    )
    try {
      const driver = await adapter.connect()
      await driver.dispose()
      expect(pool.ended).to.equal(true)
    } finally {
      if (!pool.ended) await pool.end()
    }
  })

  it('preserves the schema in the adapter and moves pool limits out of the URL', async () => {
    const { pool, adapter, max } = createPrismaPool(
      'postgresql://localhost/test?schema=tenant&connection_limit=200',
      '3'
    )
    try {
      expect(max).to.equal(3)
      expect(pool.options.max).to.equal(3)
      expect(pool.options.connectionTimeoutMillis).to.equal(5_000)
      expect(pool.options.idleTimeoutMillis).to.equal(300_000)
      expect(pool.options.connectionString).not.to.include('connection_limit')
      expect(pool.options.connectionString).not.to.include('schema=')
      const driver = await adapter.connect()
      expect(driver.underlyingDriver()).to.equal(pool)
      expect(driver.getConnectionInfo?.().schemaName).to.equal('tenant')
      await driver.dispose()
      // Externally owned pools remain usable after adapter disposal.
      expect(pool.ended).to.equal(false)
    } finally {
      await pool.end()
    }
  })
})

describe('Pool error observation', () => {
  it('removes only its own listener when stopped', async () => {
    const { pool } = createPrismaPool('postgresql://localhost/test')
    const calls: unknown[][] = []
    const other = () => calls.push(['other'])
    pool.on('error', other)
    const stop = observePoolErrors(pool, {
      error: (...args) => calls.push(args)
    })
    const failure = new Error('connection lost')
    try {
      pool.emit('error', failure)
      expect(calls).to.deep.equal([
        ['other'],
        ['PostgreSQL pool error', failure.stack]
      ])
      stop()
      stop()
      calls.length = 0
      pool.emit('error', failure)
      expect(calls).to.deep.equal([['other']])
    } finally {
      stop()
      await pool.end()
    }
  })
})
