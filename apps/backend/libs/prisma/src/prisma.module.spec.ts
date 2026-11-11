import { Test } from '@nestjs/testing'
import { expect } from 'chai'
import { createSandbox } from 'sinon'
import Instrumentation from '../../instrumentation'
import { PrismaModule } from './prisma.module'
import { PrismaService } from './prisma.service'

describe('PrismaModule telemetry shutdown', () => {
  it('closes the pool before telemetry and waits for telemetry to finish', async () => {
    const sandbox = createSandbox()
    let finish!: () => void
    let started!: () => void
    const telemetryStarted = new Promise<void>((resolve) => {
      started = resolve
    })
    const telemetryFinished = new Promise<void>((resolve) => {
      finish = resolve
    })
    const closePool = sandbox.stub().resolves()
    const shutdown = sandbox
      .stub(Instrumentation, 'shutdown')
      .callsFake(async () => {
        expect(closePool.calledOnce).to.equal(true)
        started()
        await telemetryFinished
      })
    const module = await Test.createTestingModule({ imports: [PrismaModule] })
      .overrideProvider(PrismaService)
      .useValue({ onModuleDestroy: closePool })
      .compile()
    try {
      await module.init()
      let completed = false
      const closing = module.close().then(() => {
        completed = true
      })
      await telemetryStarted
      expect(completed).to.equal(false)
      finish()
      await closing
      expect(shutdown.calledOnce).to.equal(true)
      expect(completed).to.equal(true)
    } finally {
      finish()
      sandbox.restore()
    }
  })
})
