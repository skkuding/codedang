import { expect } from 'chai'
import { getAmqpUrl, getPositiveIntEnv } from '../src/config'

const ENV_KEYS = [
  'TEST_TTL',
  'APP_ENV',
  'RABBITMQ_SSL',
  'RABBITMQ_DEFAULT_USER',
  'RABBITMQ_DEFAULT_PASS'
]

describe('config', () => {
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key]
      delete process.env[key]
    }
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = saved[key]
      }
    }
  })

  describe('getPositiveIntEnv', () => {
    it('should return the default when unset or empty', () => {
      expect(getPositiveIntEnv('TEST_TTL', 100)).to.equal(100)
      process.env.TEST_TTL = ''
      expect(getPositiveIntEnv('TEST_TTL', 100)).to.equal(100)
    })

    it('should parse a positive integer', () => {
      process.env.TEST_TTL = '5000'
      expect(getPositiveIntEnv('TEST_TTL', 100)).to.equal(5000)
    })

    for (const raw of ['abc', '0', '-1', '1.5', '2147483648']) {
      it(`should reject "${raw}"`, () => {
        process.env.TEST_TTL = raw
        expect(() => getPositiveIntEnv('TEST_TTL', 100)).to.throw('TEST_TTL')
      })
    }
  })

  describe('getAmqpUrl', () => {
    it('should use local defaults outside production/stage', () => {
      expect(getAmqpUrl()).to.equal('amqp://skku:1234@localhost:5672/vh')
    })

    it('should encode credentials and honor SSL', () => {
      process.env.RABBITMQ_SSL = 'true'
      process.env.RABBITMQ_DEFAULT_USER = 'user'
      process.env.RABBITMQ_DEFAULT_PASS = 'p@ss/word'
      expect(getAmqpUrl()).to.equal(
        'amqps://user:p%40ss%2Fword@localhost:5672/vh'
      )
    })

    for (const env of ['production', 'stage']) {
      it(`should require credentials when APP_ENV=${env}`, () => {
        process.env.APP_ENV = env
        expect(() => getAmqpUrl()).to.throw('must be set')
      })
    }
  })
})
