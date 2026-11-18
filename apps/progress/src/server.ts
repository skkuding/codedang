import { getAmqpUrl, getPositiveIntEnv } from './config'
import { createLogger } from './logger'
import {
  DEFAULT_FINISHED_TTL_MS,
  DEFAULT_IDLE_TTL_MS,
  ProgressStore
} from './progressStore'
import { startProgressConsumer } from './rabbitConsumer'
import { startWebSocketServer } from './wsServer'

const logger = createLogger('Server')

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
