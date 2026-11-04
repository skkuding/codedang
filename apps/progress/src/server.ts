import { ProgressStore } from './progressStore'
import { startProgressConsumer } from './rabbitConsumer'
import { startWebSocketServer } from './wsServer'

// 백엔드(libs/amqp/src/amqp.module.ts)와 같은 환경변수를 쓴다.
// 기본값은 루트 docker-compose.yml의 로컬 RabbitMQ 설정이다.
function getAmqpUrl() {
  const protocol = process.env.RABBITMQ_SSL === 'true' ? 'amqps' : 'amqp'
  const isProd = process.env.NODE_ENV === 'production'
  const user =
    process.env.RABBITMQ_DEFAULT_USER ?? (isProd ? undefined : 'skku')
  const pass =
    process.env.RABBITMQ_DEFAULT_PASS ?? (isProd ? undefined : '1234')
  if (!user || !pass) {
    throw new Error(
      'RABBITMQ_DEFAULT_USER and RABBITMQ_DEFAULT_PASS must be set in production'
    )
  }
  const host = process.env.RABBITMQ_HOST ?? 'localhost'
  const port = process.env.RABBITMQ_PORT ?? '5672'
  const vhost = process.env.RABBITMQ_DEFAULT_VHOST ?? 'vh'

  return `${protocol}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${encodeURIComponent(vhost)}`
}

async function main() {
  const wsPort = Number(process.env.WS_PORT ?? 8080)

  const store = new ProgressStore()
  const { broadcast } = startWebSocketServer(wsPort, store)

  await startProgressConsumer(getAmqpUrl(), (event) => {
    const update = store.handleProgress(event)
    if (update) {
      broadcast(update)
    }
  })

  console.log(
    `[progress-server] websocket listening on ws://localhost:${wsPort}`
  )
}

main().catch((e) => {
  console.error('[progress-server] fatal error', e)
  process.exit(1)
})
