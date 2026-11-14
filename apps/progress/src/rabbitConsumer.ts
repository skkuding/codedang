import amqp from 'amqplib'
import { createLogger } from './logger'
import { isIrisProgressPayload, type ProgressEvent } from './types'

const logger = createLogger('RabbitConsumer')

// Same exchange/routing key as the NestJS backend (apps/backend/libs/constants/src/rabbitmq.constants.ts)
const EXCHANGE = 'iris.e.direct.judge'
const ROUTING_KEY = 'judge.result'
// Must differ from the backend queue so each receives its own copy of every message.
// NOTE: instances share this queue, so run a single replica.
const QUEUE = 'progress.q.judge.result'

const PROGRESS_MESSAGE_TYPE = 'progress'

// Drop stale progress that piled up while the server was down.
const MESSAGE_TTL_MS = 60_000

function toProgressEvent(raw: amqp.ConsumeMessage): ProgressEvent | null {
  // The submission id comes in messageId, not in the body.
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

function safeAck(channel: amqp.Channel, raw: amqp.ConsumeMessage) {
  try {
    channel.ack(raw)
  } catch (e) {
    logger.error({ err: e }, 'failed to ack message')
  }
}

function safeNack(channel: amqp.Channel, raw: amqp.ConsumeMessage) {
  try {
    channel.nack(raw, false, false)
  } catch (e) {
    logger.error({ err: e }, 'failed to nack message')
  }
}

/**
 * Delivery guarantee: best-effort (at-most-once).
 * Progress is display-only and the backend result is the source of truth,
 * so invalid or failed messages are nacked without requeue.
 * Redelivered messages are deduplicated by ProgressStore.
 */
function handleMessage(
  channel: amqp.Channel,
  raw: amqp.ConsumeMessage,
  onProgress: (event: ProgressEvent) => void
) {
  if (raw.properties.type !== PROGRESS_MESSAGE_TYPE) {
    safeAck(channel, raw)
    return
  }

  try {
    const event = toProgressEvent(raw)
    if (!event) {
      logger.warn(
        {
          messageId: raw.properties.messageId,
          content: raw.content.toString()
        },
        'invalid progress message'
      )
      safeNack(channel, raw)
      return
    }

    onProgress(event)
    safeAck(channel, raw)
  } catch (e) {
    logger.error({ err: e }, 'failed to process message')
    safeNack(channel, raw)
  }
}

export async function startProgressConsumer(
  amqpUrl: string,
  onProgress: (event: ProgressEvent) => void
) {
  const connection = await amqp.connect(amqpUrl)
  connection.on('error', (e) =>
    logger.error({ err: e }, 'amqp connection error')
  )
  connection.on('close', () => {
    logger.error('amqp connection closed')
    process.exit(1)
  })

  const channel = await connection.createChannel()
  channel.on('error', (e) => logger.error({ err: e }, 'amqp channel error'))
  channel.on('close', () => {
    logger.error('amqp channel closed')
    process.exit(1)
  })

  await channel.assertExchange(EXCHANGE, 'direct', { durable: true })
  await channel.assertQueue(QUEUE, {
    durable: true,
    messageTtl: MESSAGE_TTL_MS
  })
  await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY)
  await channel.prefetch(20)

  await channel.consume(QUEUE, (raw) => {
    if (!raw) {
      logger.error('consumer cancelled by broker')
      process.exit(1)
    }
    handleMessage(channel, raw, onProgress)
  })

  logger.info(`consuming ${QUEUE} bound to ${EXCHANGE}/${ROUTING_KEY}`)

  return { connection, channel }
}
