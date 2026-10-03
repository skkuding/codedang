import { expect } from 'chai'
import pino from 'pino'
import { pinoLoggerModuleOption } from './pino-option.logger'

describe('pinoLoggerModuleOption', () => {
  it('인증 헤더와 비밀번호를 마스킹한다', () => {
    const lines: string[] = []
    const { redact } = pinoLoggerModuleOption.pinoHttp as pino.LoggerOptions
    const logger = pino({ redact }, { write: (line) => lines.push(line) })

    const reqHeaders: Record<string, string> = { authorization: 'Bearer token' }
    reqHeaders['email-auth'] = 'token'
    reqHeaders.cookie = 'refresh_token=token'

    const resHeaders: Record<string, string | string[]> = {
      authorization: 'Bearer token'
    }
    resHeaders['email-auth'] = 'token'
    resHeaders['set-cookie'] = ['refresh_token=token']

    logger.info({
      req: {
        headers: reqHeaders,
        body: { password: 'pw', passwordAgain: 'pw' }
      },
      res: { headers: resHeaders },
      password: 'hash'
    })

    const log = JSON.parse(lines[0])
    expect(log.req.headers.authorization).to.equal('[Redacted]')
    expect(log.res.headers.authorization).to.equal('[Redacted]')
    expect(log.req.headers['email-auth']).to.equal('[Redacted]')
    expect(log.res.headers['email-auth']).to.equal('[Redacted]')
    expect(log.req.headers.cookie).to.equal('[Redacted]')
    expect(log.res.headers['set-cookie']).to.equal('[Redacted]')
    expect(log.password).to.equal('[Redacted]')
    expect(log.req.body.password).to.equal('[Redacted]')
    expect(log.req.body.passwordAgain).to.equal('[Redacted]')
  })
})
