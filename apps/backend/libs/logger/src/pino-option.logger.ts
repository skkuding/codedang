import { gray, italic, white } from 'colorette'
import { randomUUID } from 'crypto'
import type { Params } from 'nestjs-pino'
import type { PrettyOptions } from 'pino-pretty'
import PinoPretty from 'pino-pretty'
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

// 비밀번호는 모든 환경에서 가린다.
const passwordPaths = [
  'password',
  'req.body.password',
  'req.body.passwordAgain'
]

// 인증 토큰은 production에서만 가린다.
// stage와 로컬은 쿠키 이름과 토큰 값이 디버깅에 필요해 그대로 둔다.
const credentialHeaderPaths = [
  'req.headers.authorization',
  'res.headers.authorization',
  'req.headers["email-auth"]',
  'res.headers["email-auth"]',
  'req.headers.cookie',
  'res.headers["set-cookie"]'
]

export const buildRedactPaths = (appEnv?: string): string[] =>
  appEnv === 'production'
    ? [...credentialHeaderPaths, ...passwordPaths]
    : passwordPaths

// TODO: change log level to nestjs-style. e.g. INFO -> LOG
export const pinoLoggerModuleOption: Params = {
  pinoHttp: {
    level: process.env.APP_ENV === 'production' ? 'info' : 'trace',
    autoLogging: true,
    formatters: {
      level(label) {
        return { level: label }
      }
    },
    stream:
      process.env.APP_ENV !== 'production' && process.env.APP_ENV !== 'stage'
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
    redact: buildRedactPaths(process.env.APP_ENV)
  }
}
