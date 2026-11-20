import { pino } from 'pino'
import PinoPretty from 'pino-pretty'

const isDeployed =
  process.env.APP_ENV === 'production' || process.env.APP_ENV === 'stage'

// Contains credentials when RabbitMQ URL (amqp://user:pass@host) is logged.
// NOTE: `*.` matches only one level of nesting.
const redactPaths = [
  'password',
  '*.password',
  'amqpUrl',
  '*.amqpUrl',
  'url',
  '*.url'
]

const rootLogger = pino(
  {
    name: 'progress-server',
    level: process.env.APP_ENV === 'production' ? 'info' : 'trace',
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    redact: redactPaths
  },
  isDeployed
    ? undefined
    : // NOTE: sync is required because process.exit() is called right after some logs
      PinoPretty({
        sync: true,
        messageFormat: (log, messageKey) => {
          const msg = String(log[messageKey] ?? '')
          const context = String(log.context ?? '')
          return context ? `${msg} -- ${context}` : msg
        },
        ignore: 'context,hostname,pid,name'
      })
)

export function createLogger(context: string) {
  return rootLogger.child({ context })
}
