import { Logger } from '@nestjs/common'
import { expect } from 'chai'
import proxyquire from 'proxyquire'
import { createSandbox, type SinonStub } from 'sinon'
import type Instrumentation from './instrumentation'

describe('Instrumentation lifecycle', () => {
  const sandbox = createSandbox()
  let instrumentation: typeof Instrumentation
  let createSdk: SinonStub
  let start: SinonStub
  let shutdown: SinonStub

  beforeEach(() => {
    start = sandbox.stub().resolves()
    shutdown = sandbox.stub().resolves()
    createSdk = sandbox.stub().returns({ start, shutdown })
    const modules: Record<string, unknown> = {}
    modules['@opentelemetry/sdk-node'] = { NodeSDK: createSdk }
    instrumentation = proxyquire('./instrumentation', modules).default
  })

  afterEach(async () => {
    shutdown.resolves()
    await instrumentation.shutdown()
    sandbox.restore()
  })

  it('keeps one SDK per process and assigns a new instance ID after restarting', async () => {
    await instrumentation.start('admin-api')
    await instrumentation.start('admin-api')
    expect(createSdk.calledOnce).to.equal(true)
    expect(start.calledOnce).to.equal(true)
    const first = createSdk.firstCall.args[0].resource.attributes
    expect(first['service.name']).to.equal('admin-api')
    expect(first['service.instance.id']).to.match(/^[0-9a-f-]{36}$/)

    await instrumentation.shutdown()
    await instrumentation.start('admin-api')

    const second = createSdk.secondCall.args[0].resource.attributes
    expect(second['service.name']).to.equal('admin-api')
    expect(second['service.instance.id']).not.to.equal(
      first['service.instance.id']
    )
  })

  it('waits for SDK shutdown before completing', async () => {
    await instrumentation.start('client-api')
    let finish!: () => void
    shutdown.returns(
      new Promise<void>((resolve) => {
        finish = resolve
      })
    )
    let completed = false
    const stopping = instrumentation.shutdown().then(() => {
      completed = true
    })
    expect(shutdown.calledOnce).to.equal(true)
    expect(completed).to.equal(false)
    finish()
    await stopping
    expect(completed).to.equal(true)
  })

  it('handles shutdown before initialization without constructing an SDK', async () => {
    const warn = sandbox.stub(Logger.prototype, 'warn')
    await instrumentation.shutdown()
    expect(createSdk.called).to.equal(false)
    expect(shutdown.called).to.equal(false)
    expect(warn.calledOnceWithExactly('OTEL SDK is not initialized')).to.equal(
      true
    )
  })
})
