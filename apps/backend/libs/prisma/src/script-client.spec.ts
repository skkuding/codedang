import { expect } from 'chai'
import proxyquire from 'proxyquire'
import { createSandbox } from 'sinon'
import { createPrismaPool } from './prisma-pool'
import { runPrismaScript } from './script-client'

describe('Prisma script runner', () => {
  const sandbox = createSandbox()
  let exitCode: typeof process.exitCode
  beforeEach(() => {
    exitCode = process.exitCode
  })
  afterEach(() => {
    process.exitCode = exitCode
    sandbox.restore()
  })

  it('creates script clients with adapter-owned pools', async () => {
    const resources = createPrismaPool(
      'postgresql://localhost/prisma_unit_tests'
    )
    const createPool = sandbox.stub().returns(resources)
    const modules: Record<string, unknown> = {}
    modules['./prisma-pool'] = { createPrismaPool: createPool }
    modules['dotenv'] = { config: () => ({ parsed: {} }) }
    modules['dotenv-expand'] = { expand: sandbox.stub() }
    const createClient: () => { $disconnect: () => Promise<void> } = proxyquire(
      './script-client',
      modules
    ).createScriptPrismaClient
    try {
      const client = createClient()
      expect(createPool.firstCall.args[2]).to.equal(true)
      await client.$disconnect()
    } finally {
      if (!resources.pool.ended) await resources.pool.end()
    }
  })

  it('waits for the script and then disconnects', async () => {
    const main = sandbox.stub().resolves()
    const disconnect = sandbox.stub().resolves()
    await runPrismaScript({ $disconnect: disconnect }, main)
    expect(main.calledBefore(disconnect)).to.equal(true)
    expect(disconnect.calledOnce).to.equal(true)
    expect(process.exitCode).to.equal(exitCode)
  })

  it('reports failure, sets a failing exit code, and still disconnects', async () => {
    const failure = new Error('script failed')
    const log = sandbox.stub(console, 'error')
    const disconnect = sandbox.stub().resolves()
    await runPrismaScript({ $disconnect: disconnect }, async () => {
      throw failure
    })
    expect(log.calledOnceWithExactly(failure)).to.equal(true)
    expect(process.exitCode).to.equal(1)
    expect(disconnect.calledOnce).to.equal(true)
  })

  it('propagates disconnection failures', async () => {
    const failure = new Error('disconnect failed')
    await expect(
      runPrismaScript(
        { $disconnect: sandbox.stub().rejects(failure) },
        async () => {}
      )
    ).to.be.rejectedWith(failure)
  })
})
