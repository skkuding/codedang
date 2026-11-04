import { WebSocketServer, WebSocket, type RawData } from 'ws'
import type { ProgressStore } from './progressStore'
import type { ProgressUpdateMessage } from './types'

// 클라이언트 메시지는 1 KiB로 제한
const MAX_PAYLOAD_BYTES = 1024
// 연결 하나가 동시에 구독할 수 있는 submission 수
const MAX_SUBSCRIPTIONS = 20
// 서버가 동시에 유지할 WebSocket 연결 수
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

/**
 * 클라이언트 → 서버: { type: 'subscribe' | 'unsubscribe', submissionId }
 * 서버 → 클라이언트: ProgressUpdateMessage (구독 시 현재 스냅샷을 먼저 보냄)
 */
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
      if (
        !subscribedIds.has(message.submissionId) &&
        subscribedIds.size >= MAX_SUBSCRIPTIONS
      ) {
        ws.send(
          JSON.stringify({ type: 'error', message: 'too many subscriptions' })
        )
        return
      }

      const snapshot = store.getSnapshot(message.submissionId)
      if (snapshot) {
        ws.send(JSON.stringify(snapshot))
      }
      if (snapshot && snapshot.status !== 'judging') {
        return
      }
      subscribedIds.add(message.submissionId)
      addSubscriber(message.submissionId, ws)
    })

    ws.on('error', (e) => {
      console.warn('[progress-server] websocket client error', e.message)
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
