import { expect } from 'chai'
import * as sinon from 'sinon'
import { ProgressStore } from '../src/progressStore'
import { SandboxStatusCode, type ProgressEvent } from '../src/types'

const event = (
  current: number,
  overrides: Partial<ProgressEvent> = {}
): ProgressEvent => ({
  submissionId: 1,
  total: 3,
  current,
  statusCode: SandboxStatusCode.RUN_SUCCESS,
  ...overrides
})

describe('ProgressStore', () => {
  let clock: sinon.SinonFakeTimers

  beforeEach(() => {
    clock = sinon.useFakeTimers()
  })

  afterEach(() => {
    clock.restore()
  })

  it('should track progress until all test cases are done', () => {
    const store = new ProgressStore()

    expect(store.handleProgress(event(1))).to.include({
      status: 'judging',
      completed: 1,
      total: 3,
      percentage: 33
    })
    store.handleProgress(event(2))
    expect(store.handleProgress(event(3))).to.include({
      status: 'done',
      completed: 3,
      percentage: 100
    })
  })

  it('should work when current starts at 0', () => {
    const store = new ProgressStore()
    store.handleProgress(event(0))
    store.handleProgress(event(1))
    expect(store.handleProgress(event(2))?.status).to.equal('done')
  })

  it('should ignore duplicate messages', () => {
    const store = new ProgressStore()
    store.handleProgress(event(1))
    expect(store.handleProgress(event(1))).to.be.null
    expect(store.getSnapshot(1)?.completed).to.equal(1)
  })

  for (const statusCode of [
    SandboxStatusCode.COMPILE_ERROR,
    SandboxStatusCode.SERVER_ERROR
  ]) {
    it(`should mark status code ${statusCode} as error`, () => {
      const store = new ProgressStore()
      expect(store.handleProgress(event(1, { statusCode }))?.status).to.equal(
        'error'
      )
    })
  }

  it('should ignore messages after the submission has finished', () => {
    const store = new ProgressStore()
    store.handleProgress(
      event(1, { statusCode: SandboxStatusCode.COMPILE_ERROR })
    )
    expect(store.handleProgress(event(2))).to.be.null
  })

  it('should return a null snapshot for unknown submissions', () => {
    expect(new ProgressStore().getSnapshot(999)).to.be.null
  })

  it('should evict idle submissions and notify the expire listener', () => {
    const store = new ProgressStore({ idleTtlMs: 1000 })
    const onExpire = sinon.spy()
    store.onExpire(onExpire)
    store.handleProgress(event(1))

    clock.tick(999)
    expect(store.getSnapshot(1)).to.not.be.null

    clock.tick(1)
    expect(store.getSnapshot(1)).to.be.null
    expect(onExpire.calledOnceWith(1)).to.be.true
  })

  it('should reset the idle timer on each update', () => {
    const store = new ProgressStore({ idleTtlMs: 1000 })
    store.handleProgress(event(1))
    clock.tick(800)
    store.handleProgress(event(2))
    clock.tick(800)
    expect(store.getSnapshot(1)).to.not.be.null
  })

  it('should keep finished submissions for the finished TTL', () => {
    const store = new ProgressStore({ finishedTtlMs: 500, idleTtlMs: 10_000 })
    store.handleProgress(event(1))
    store.handleProgress(event(2))
    store.handleProgress(event(3))

    clock.tick(499)
    expect(store.getSnapshot(1)?.status).to.equal('done')
    clock.tick(1)
    expect(store.getSnapshot(1)).to.be.null
  })
})
