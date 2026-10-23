import amqp from 'amqplib'
import { isIrisProgressPayload, type ProgressEvent } from './types'

// NestJS 백엔드와 동일한 exchange/routing key (apps/backend/libs/constants/src/rabbitmq.constants.ts)
const EXCHANGE = 'iris.e.direct.judge'
const ROUTING_KEY = 'judge.result'
// 백엔드 큐와 이름이 달라야 같은 메시지의 복사본을 각각 받는다.
const QUEUE = 'progress.q.judge.result'

const PROGRESS_MESSAGE_TYPE = 'progress'

// 서버가 꺼져 있던 동안 쌓인 오래된 진행률은 버린다.
const MESSAGE_TTL_MS = 60_000

function toProgressEvent(raw: amqp.ConsumeMessage): ProgressEvent | null {
  // submission id는 body가 아니라 messageId에 문자열로 온다.
  const submissionId = Number(raw.properties.messageId)
  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return null
  }

  const payload: unknown = JSON.parse(raw.content.toString())
  if (!isIrisProgressPayload(payload)) {
    return null
  }

  return { submissionId, ...payload }
}

export async function startProgressConsumer(
  amqpUrl: string,
  onProgress: (event: ProgressEvent) => void
) {
  const connection = await amqp.connect(amqpUrl)
  const channel = await connection.createChannel()

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true })
  await channel.assertQueue(QUEUE, {
    durable: true,
    messageTtl: MESSAGE_TTL_MS
  })
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY)
  await channel.prefetch(20)

  await channel.consume(QUEUE, (raw) => {
    if (!raw) {
      return
    }

    if (raw.properties.type !== PROGRESS_MESSAGE_TYPE) {
      channel.ack(raw)
      return
    }

    try {
      const event = toProgressEvent(raw)
      if (!event) {
        console.warn(
          '[progress-server] invalid progress message',
          raw.properties.messageId,
          raw.content.toString()
        )
        channel.nack(raw, false, false)
        return
      }

      onProgress(event)
      channel.ack(raw)
    } catch (e) {
      console.error('[progress-server] failed to process message', e)
      // 재시도해도 같은 에러라 requeue하지 않는다.
      channel.nack(raw, false, false)
    }
  })

  console.log(
    `[progress-server] consuming ${QUEUE} bound to ${EXCHANGE}/${ROUTING_KEY}`
  )

  return { connection, channel }
}
