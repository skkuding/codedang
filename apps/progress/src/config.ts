// Same env vars as libs/amqp/src/amqp.module.ts; defaults match docker-compose.yml
export function getAmqpUrl() {
  const protocol = process.env.RABBITMQ_SSL === 'true' ? 'amqps' : 'amqp'
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

// setTimeout fires immediately above this
const MAX_TIMER_MS = 2_147_483_647

export function getPositiveIntEnv(name: string, defaultValue: number) {
  const raw = process.env[name]
  if (raw === undefined || raw === '') {
    return defaultValue
  }
  const value = Number(raw)
  if (!Number.isInteger(value) || value <= 0 || value > MAX_TIMER_MS) {
    throw new Error(
      `${name} must be an integer between 1 and ${MAX_TIMER_MS}, got "${raw}"`
    )
  }
  return value
}
