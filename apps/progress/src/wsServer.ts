import { WebSocketServer, WebSocket, type RawData } from 'ws'
import type { ProgressStore } from './progressStore'
import type { ProgressUpdateMessage } from './types'

const MAX_PAYLOAD_BYTES = 1024
const MAX_SUBSCRIPTIONS = 20
const MAX_CONNECTIONS = 1000

interface ClientMessage {
  type: 'subscribe' | 'unsubscribe'
  submissionId: number
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
    !Number.isInteger(submissionId)
  ) {
    return null
  }
  return { type, submissionId }
}

export function startWebSocketServer(port: number, store: ProgressStore) {
  const subscribers = new Map<number, Set<WebSocket>>()
  const wss = new WebSocketServer({ port, maxPayload: MAX_PAYLOAD_BYTES })

  function addSubscriber(id: number, ws: WebSocket) {
    const conns = subscribers.get(id) ?? new Set<WebSocket>()
    conns.add(ws)
    subscribers.set(id, conns)
  }

  function removeSubscriber(id: number, ws: WebSocket) {
    const conns = subscribers.get(id)
    if (!conns) {
      return
    }
    conns.delete(ws)
    if (conns.size === 0) {
      subscribers.delete(id)
    }
  }

  wss.on('connection', (ws) => {
    ws.on('error', (e) => {
      console.warn('[progress-server] websocket client error', e.message)
    })

    if (wss.clients.size > MAX_CONNECTIONS) {
      ws.close(1013, 'too many connections')
      return
    }
    const subscribedIds = new Set<number>()

    ws.on('message', (raw) => {
      const message = parseClientMessage(raw)
      if (!message) {
        return
      }

      if (message.type === 'unsubscribe') {
        subscribedIds.delete(message.submissionId)
        removeSubscriber(message.submissionId, ws)
        return
      }

      for (const id of subscribedIds) {
        if (!subscribers.get(id)?.has(ws)) {
          subscribedIds.delete(id)
        }
      }

      const snapshot = store.getSnapshot(message.submissionId)
      const isFinished = snapshot !== null && snapshot.status !== 'judging'
      if (
        !isFinished &&
        !subscribedIds.has(message.submissionId) &&
        subscribedIds.size >= MAX_SUBSCRIPTIONS
      ) {
        ws.send(
          JSON.stringify({ type: 'error', message: 'too many subscriptions' })
        )
        return
      }
      if (snapshot) {
        ws.send(JSON.stringify(snapshot))
      }
      if (isFinished) {
        return
      }
      subscribedIds.add(message.submissionId)
      addSubscriber(message.submissionId, ws)
    })

    ws.on('close', () => {
      for (const id of subscribedIds) {
        removeSubscriber(id, ws)
      }
    })
  })

  function broadcast(update: ProgressUpdateMessage) {
    const conns = subscribers.get(update.submissionId)
    if (!conns) {
      return
    }

    const payload = JSON.stringify(update)
    for (const ws of conns) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload)
      }
    }

    if (update.status !== 'judging') {
      subscribers.delete(update.submissionId)
    }
  }

  return { wss, broadcast }
}
