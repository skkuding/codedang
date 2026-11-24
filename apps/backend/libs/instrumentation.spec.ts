import { expect } from 'chai'
import * as sinon from 'sinon'
import Instrumentation, {
  InstrumentationShutdownService
} from './instrumentation'

describe('instrumentation', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('모듈을 불러도 SIGTERM 핸들러를 직접 등록하지 않는다', async () => {
    // 모듈 최상단에서 등록하는 핸들러를 보려면 캐시를 비우고 다시 불러야 한다
    const modulePath = require.resolve('./instrumentation')
    const cached = require.cache[modulePath]
    delete require.cache[modulePath]
    const before = process.listenerCount('SIGTERM')

    await import('./instrumentation')

    const after = process.listenerCount('SIGTERM')
    delete require.cache[modulePath]
    if (cached) {
      require.cache[modulePath] = cached
    }

    expect(after).to.equal(before)
  })

  it('NestJS 종료 훅에서 OTEL SDK를 정리한다', async () => {
    const shutdown = sinon.stub(Instrumentation, 'shutdown').resolves()

    await new InstrumentationShutdownService().onApplicationShutdown()

    expect(shutdown.calledOnce).to.be.true
  })
})
