import { gray, italic, white } from 'colorette'
import { randomUUID } from 'crypto'
import type { Params } from 'nestjs-pino'
import PinoPretty from 'pino-pretty'
import type { PrettyOptions } from 'pino-pretty'
import { format } from 'sql-formatter'
import type { AuthenticatedRequest } from '@libs/auth'

const pinoPrettyOptions: PrettyOptions = {
  messageFormat: (log, messageKey) => {
    const msg = log[messageKey] as string
    const contextName = gray(italic(log.context as string))
    return msg && contextName
      ? `${msg} ${white('--')} ${contextName}`
      : `${msg}${contextName}`
  },
  customPrettifiers: {
    query: (q: string) => format(q, { language: 'postgresql' })
  },
  ignore: 'context,hostname,pid,message'
}

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
    stream:
      process.env.NODE_ENV !== 'production'
        ? PinoPretty(pinoPrettyOptions)
        : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mixin(mergeObject: any) {
      if (!mergeObject.msg && mergeObject.message) {
        mergeObject = { ...mergeObject, msg: mergeObject.message }
      }
      return mergeObject
    },
    customProps(req: AuthenticatedRequest) {
      return req.user
        ? {
            user: {
              id: req.user.id,
              username: req.user.username
            }
          }
        : { user: 'undefined' }
    },
    genReqId(req, res) {
      // TODO: x-request-id를 reverse proxy에서 추가하는 경우, 아래 코드를 변경해야 함. 현재는 request id를 nest에서만 할당하는 것으로 가정.
      const id = randomUUID()
      res.setHeader('X-Request-Id', id)
      return id
    },
    serializers: {
      req(req) {
        req.body = req.raw?.body
        return req
      }
    },
    redact: ['req.body.password']
    // enabled: !!process.env.NOLOG
  }
}
