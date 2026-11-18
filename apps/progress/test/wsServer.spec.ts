import { expect } from 'chai'
import type { AddressInfo } from 'net'
import { WebSocket } from 'ws'
import { ProgressStore, type ProgressStoreOptions } from '../src/progressStore'
import { startWebSocketServer } from '../src/wsServer'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface Received {
  type: string
  submissionId?: number
  completed?: number
  message?: string
}

describe('startWebSocketServer', () => {
  let cleanups: (() => void)[] = []

  afterEach(async () => {
    for (const cleanup of cleanups) {
      cleanup()
    }
    cleanups = []
    await sleep(20)
  })

  function setup(
    storeOptions: ProgressStoreOptions = {},
    heartbeatMs = 60_000
  ) {
    const store = new ProgressStore(storeOptions)
    const { wss, broadcast } = startWebSocketServer(0, store, {
      heartbeatIntervalMs: heartbeatMs
    })
    cleanups.push(() => wss.close())
    const { port } = wss.address() as AddressInfo

    const feed = (submissionId: number, current: number) => {
      const update = store.handleProgress({
        submissionId,
        current,
        total: 3,
        statusCode: 0
      })
      if (update) {
        broadcast(update)
      }
    }

    const connect = async (options: { autoPong?: boolean } = {}) => {
      const ws = new WebSocket(`ws://localhost:${port}`, options)
      const received: Received[] = []
      ws.on('message', (data) => received.push(JSON.parse(data.toString())))
      cleanups.push(() => ws.terminate())
      await new Promise((resolve) => ws.once('open', resolve))
      const send = async (data: unknown) => {
        ws.send(typeof data === 'string' ? data : JSON.stringify(data))
        await sleep(20)
      }
      return { ws, received, send }
    }

    return { wss, feed, connect }
  }

  it('should deliver updates to subscribers', async () => {
    const { feed, connect } = setup()
    const client = await connect()

    await client.send({ type: 'subscribe', submissionId: 1 })
    feed(1, 1)
    await sleep(20)

    expect(client.received).to.have.lengthOf(1)
    expect(client.received[0]).to.include({
      type: 'progress',
      submissionId: 1,
      completed: 1
    })
  })

  it('should send a snapshot on subscribe', async () => {
    const { feed, connect } = setup()
    feed(1, 1)
    const client = await connect()

    await client.send({ type: 'subscribe', submissionId: 1 })

    expect(client.received).to.have.lengthOf(1)
    expect(client.received[0]).to.include({ type: 'progress', completed: 1 })
  })

  it('should stop delivering after unsubscribe', async () => {
    const { feed, connect } = setup()
    const client = await connect()

    await client.send({ type: 'subscribe', submissionId: 1 })
    await client.send({ type: 'unsubscribe', submissionId: 1 })
    feed(1, 1)
    await sleep(20)

    expect(client.received).to.be.empty
  })

  const ignoredMessages: [string, unknown][] = [
    ['malformed JSON', '{oops'],
    ['an unknown type', { type: 'hello', submissionId: 1 }],
    ['a non-positive id', { type: 'subscribe', submissionId: 0 }]
  ]

  for (const [name, data] of ignoredMessages) {
    it(`should ignore ${name}`, async () => {
      const { feed, connect } = setup()
      const client = await connect()

      await client.send(data)
      feed(1, 1)
      await sleep(20)

      expect(client.received).to.be.empty
    })
  }

  it('should reject subscriptions beyond the limit', async () => {
    const { connect } = setup()
    const client = await connect()

    for (let id = 1; id <= 21; id++) {
      client.ws.send(JSON.stringify({ type: 'subscribe', submissionId: id }))
    }
    await sleep(50)

    expect(client.received).to.deep.equal([
      { type: 'error', message: 'too many subscriptions' }
    ])
  })

  it('should notify subscribers when an idle submission expires', async () => {
    const { feed, connect } = setup({ idleTtlMs: 50 })
    const client = await connect()

    await client.send({ type: 'subscribe', submissionId: 1 })
    feed(1, 1)
    await sleep(100)
    feed(1, 2)
    await sleep(20)

    expect(client.received.map((m) => m.type)).to.deep.equal([
      'progress',
      'expired'
    ])
  })

  it('should terminate clients that do not answer pings', async () => {
    const { wss, connect } = setup({}, 50)
    const alive = await connect()
    const dead = await connect({ autoPong: false })
    let deadClosed = false
    dead.ws.on('close', () => (deadClosed = true))

    await sleep(200)

    expect(deadClosed).to.be.true
    expect(alive.ws.readyState).to.equal(WebSocket.OPEN)
    expect(wss.clients.size).to.equal(1)
  })
})
