import { expect } from 'chai'
import pino from 'pino'
import { buildRedactPaths } from './pino-option.logger'

const logSample = (redact: string[]) => {
  const lines: string[] = []
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

  return JSON.parse(lines[0])
}

describe('buildRedactPaths', () => {
  it('production에서 인증 헤더와 비밀번호를 마스킹한다', () => {
    const log = logSample(buildRedactPaths('production'))

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

  it('stage에서는 비밀번호만 마스킹하고 인증 헤더는 남긴다', () => {
    const log = logSample(buildRedactPaths('stage'))

    expect(log.password).to.equal('[Redacted]')
    expect(log.req.body.password).to.equal('[Redacted]')
    expect(log.req.body.passwordAgain).to.equal('[Redacted]')
    expect(log.req.headers.authorization).to.equal('Bearer token')
    expect(log.req.headers.cookie).to.equal('refresh_token=token')
    expect(log.res.headers['set-cookie']).to.deep.equal(['refresh_token=token'])
  })

  it('APP_ENV가 없거나 알 수 없는 값이면 가리는 쪽으로 떨어진다', () => {
    const production = buildRedactPaths('production')

    expect(buildRedactPaths(undefined)).to.deep.equal(production)
    expect(buildRedactPaths('')).to.deep.equal(production)
    expect(buildRedactPaths('producton')).to.deep.equal(production)
    expect(buildRedactPaths('local')).to.deep.equal(production)
  })
})
