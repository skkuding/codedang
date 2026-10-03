import { expect } from 'chai'
import pino from 'pino'
import { pinoLoggerModuleOption } from './pino-option.logger'

describe('pinoLoggerModuleOption', () => {
  it('인증 헤더와 비밀번호를 마스킹한다', () => {
    const lines: string[] = []
    const { redact } = pinoLoggerModuleOption.pinoHttp as pino.LoggerOptions
    const logger = pino({ redact }, { write: (line) => lines.push(line) })

    const resHeaders: Record<string, string[]> = {}
    resHeaders['set-cookie'] = ['refresh_token=token']

    logger.info({
      req: {
        headers: {
          authorization: 'Bearer token',
          cookie: 'refresh_token=token'
        },
        body: { password: 'pw', passwordAgain: 'pw' }
      },
      res: { headers: resHeaders }
    })

    const log = JSON.parse(lines[0])
    expect(log.req.headers.authorization).to.equal('[Redacted]')
    expect(log.req.headers.cookie).to.equal('[Redacted]')
    expect(log.res.headers['set-cookie']).to.equal('[Redacted]')
    expect(log.req.body.password).to.equal('[Redacted]')
    expect(log.req.body.passwordAgain).to.equal('[Redacted]')
  })
})
