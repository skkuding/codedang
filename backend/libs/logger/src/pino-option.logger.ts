import type { Params } from 'nestjs-pino'
import type { PrettyOptions } from 'pino-pretty'

// TODO: include context in message format of pino-pretty
// TODO: add customPrettiers option to refine logs, such as query
const pinoPrettyOptions: PrettyOptions = {}

// TODO: change log level to nestjs-style. e.g. INFO -> LOG
export const pinoLoggerModuleOption: Params = {
  pinoHttp: {
    level: 'trace', // TODO: in production mode, set log level as 'info'
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
