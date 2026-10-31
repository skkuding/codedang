import { ProgressStore } from './progressStore'
import { startProgressConsumer } from './rabbitConsumer'
import { startWebSocketServer } from './wsServer'

// 백엔드(libs/amqp/src/amqp.module.ts)와 같은 환경변수를 쓴다.
// 기본값은 루트 docker-compose.yml의 로컬 RabbitMQ 설정이다.
function getAmqpUrl() {
  const protocol = process.env.RABBITMQ_SSL === 'true' ? 'amqps' : 'amqp'
  const user = process.env.RABBITMQ_DEFAULT_USER ?? 'skku'
  const pass = process.env.RABBITMQ_DEFAULT_PASS ?? '1234'
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
