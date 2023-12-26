import type { Params } from 'nestjs-pino'
import type { PrettyOptions } from 'pino-pretty'

// TODO: include context in message format of pino-pretty
const pinoPrettyOptions: PrettyOptions = {}

// TODO: change log level to nestjs-style. e.g. INFO -> LOG
export const pinoLoggerModuleOption: Params = {
  pinoHttp: {
    level: 'info',
    autoLogging: true,
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: pinoPrettyOptions
          }
        : undefined
  }
}
