import { createLogger } from './logger'
import {
  DEFAULT_FINISHED_TTL_MS,
  DEFAULT_IDLE_TTL_MS,
  ProgressStore
} from './progressStore'
import { startProgressConsumer } from './rabbitConsumer'
import { startWebSocketServer } from './wsServer'

const logger = createLogger('Server')

// Uses the same env vars as the backend (libs/amqp/src/amqp.module.ts).
// Defaults match the local RabbitMQ in the root docker-compose.yml.
function getAmqpUrl() {
  const protocol = process.env.RABBITMQ_SSL === 'true' ? 'amqps' : 'amqp'
  // Same deployment env var as the backend
  const isDeployed =
    process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage'
  const user =
    process.env.RABBITMQ_DEFAULT_USER ?? (isDeployed ? undefined : 'skku')
  const pass =
    process.env.RABBITMQ_DEFAULT_PASS ?? (isDeployed ? undefined : '1234')
  if (!user || !pass) {
    throw new Error(
      'RABBITMQ_DEFAULT_USER and RABBITMQ_DEFAULT_PASS must be set in production/stage'
    )
  }
  const host = process.env.RABBITMQ_HOST ?? 'localhost'
  const port = process.env.RABBITMQ_PORT ?? '5672'
  const vhost = process.env.RABBITMQ_DEFAULT_VHOST ?? 'vh'

  return `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${encodeURIComponent(vhost)}`
}

function getPositiveIntEnv(name: string, defaultValue: number) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') {
    return defaultValue
  }
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`)
  }
  return value
}

async function main() {
  const wsPort = Number(process.env.WS_PORT ?? 8080)

  const store = new ProgressStore({
    finishedTtlMs: getPositiveIntEnv(
      'PROGRESS_FINISHED_TTL_MS',
      DEFAULT_FINISHED_TTL_MS
    ),
    idleTtlMs: getPositiveIntEnv('PROGRESS_IDLE_TTL_MS', DEFAULT_IDLE_TTL_MS)
  })
  const { broadcast } = startWebSocketServer(wsPort, store)

  await startProgressConsumer(getAmqpUrl(), (event) => {
    const update = store.handleProgress(event)
    if (update) {
      broadcast(update)
    }
  })

  logger.info(`websocket listening on ws://localhost:${wsPort}`)
}

main().catch((e) => {
  logger.fatal({ err: e }, 'fatal error')
  process.exit(1)
})
