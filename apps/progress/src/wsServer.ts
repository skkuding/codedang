import { WebSocketServer, WebSocket, type RawData } from 'ws'
import { createLogger } from './logger'
import type { ProgressStore } from './progressStore'
import type { ProgressUpdateMessage } from './types'

const logger = createLogger('WebSocketServer')

const MAX_PAYLOAD_BYTES = 1024
const MAX_SUBSCRIPTIONS = 20
const MAX_CONNECTIONS = 1000
const MAX_BUFFERED_BYTES = 1024 * 1024
const DEFAULT_HEARTBEAT_INTERVAL_MS = 30_000

interface ClientMessage {
  type: 'subscribe' | 'unsubscribe'
  submissionId: number
}

export interface WebSocketServerOptions {
  heartbeatIntervalMs?: number
}

function parseClientMessage(raw: RawData): ClientMessage | null {
  let data: unknown
  try {
    data = JSON.parse(raw.toString())
  } catch {
    return null
  }
  if (
    typeof data !== 'object' ||
    data === null ||
    !('type' in data) ||
    !('submissionId' in data)
  ) {
    return null
  }
  const { type, submissionId } = data
  if (
    (type !== 'subscribe' && type !== 'unsubscribe') ||
    typeof submissionId !== 'number' ||
    !Number.isInteger(submissionId) ||
    submissionId <= 0
  ) {
    return null
  }
  return { type, submissionId }
}

// Terminate clients that stop reading, to bound outbound memory.
function safeSend(ws: WebSocket, data: string) {
  if (ws.readyState !== WebSocket.OPEN) {
    return
  }
  if (ws.bufferedAmount > MAX_BUFFERED_BYTES) {
    logger.warn('terminating slow websocket client')
    ws.terminate()
    return
  }
  ws.send(data)
}

export function startWebSocketServer(
  port: number,
  store: ProgressStore,
  options: WebSocketServerOptions = {}
) {
  // Keep both maps in sync
  const subscribers = new Map<number, Set<WebSocket>>()
  const subscribedIdsByClient = new Map<WebSocket, Set<number>>()
  // Clients that answered the last ping
  const aliveClients = new WeakSet<WebSocket>()
  const wss = new WebSocketServer({ port, maxPayload: MAX_PAYLOAD_BYTES })

  function addSubscriber(id: number, ws: WebSocket) {
    const conns = subscribers.get(id) ?? new Set<WebSocket>()
    conns.add(ws)
    subscribers.set(id, conns)
    subscribedIdsByClient.get(ws)?.add(id)
  }

  function removeSubscriber(id: number, ws: WebSocket) {
    subscribedIdsByClient.get(ws)?.delete(id)
    const conns = subscribers.get(id)
    if (!conns) {
      return
    }
    conns.delete(ws)
    if (conns.size === 0) {
      subscribers.delete(id)
    }
  }

  function removeSubmission(id: number) {
    const conns = subscribers.get(id)
    if (!conns) {
      return
    }
    for (const ws of conns) {
      subscribedIdsByClient.get(ws)?.delete(id)
    }
    subscribers.delete(id)
  }

  // Drop subscriptions of submissions evicted by the store's TTL
  store.onExpire(removeSubmission)

  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!aliveClients.has(ws)) {
        // terminate() emits 'close', which removes the subscriptions
        ws.terminate()
        continue
      }
      aliveClients.delete(ws)
      ws.ping()
    }
  }, options.heartbeatIntervalMs ?? DEFAULT_HEARTBEAT_INTERVAL_MS)

  wss.on('close', () => {
    clearInterval(heartbeat)
  })

  wss.on('connection', (ws) => {
    ws.on('error', (e) => {
      logger.warn({ err: e }, 'websocket client error')
    })
    aliveClients.add(ws)
    ws.on('pong', () => {
      aliveClients.add(ws)
    })

    if (wss.clients.size > MAX_CONNECTIONS) {
      ws.close(1013, 'too many connections')
      return
    }
    const subscribedIds = new Set<number>()
    subscribedIdsByClient.set(ws, subscribedIds)

    // TODO: authenticate and check submission visibility before subscribing
    ws.on('message', (raw) => {
      const message = parseClientMessage(raw)
      if (!message) {
        return
      }

      if (message.type === 'unsubscribe') {
        removeSubscriber(message.submissionId, ws)
        return
      }

      const snapshot = store.getSnapshot(message.submissionId)
      const isFinished = snapshot !== null && snapshot.status !== 'judging'
      if (
        !isFinished &&
        !subscribedIds.has(message.submissionId) &&
        subscribedIds.size >= MAX_SUBSCRIPTIONS
      ) {
        safeSend(
          ws,
          JSON.stringify({ type: 'error', message: 'too many subscriptions' })
        )
        return
      }
      if (snapshot) {
        safeSend(ws, JSON.stringify(snapshot))
      }
      if (isFinished) {
        return
      }
      addSubscriber(message.submissionId, ws)
    })

    ws.on('close', () => {
      for (const id of [...subscribedIds]) {
        removeSubscriber(id, ws)
      }
      subscribedIdsByClient.delete(ws)
    })
  })

  function broadcast(update: ProgressUpdateMessage) {
    const conns = subscribers.get(update.submissionId)
    if (!conns) {
      return
    }

    const payload = JSON.stringify(update)
    for (const ws of conns) {
      safeSend(ws, payload)
    }

    if (update.status !== 'judging') {
      removeSubmission(update.submissionId)
    }
  }

  return { wss, broadcast }
}
