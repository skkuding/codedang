import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { CacheModule } from '@nestjs/cache-manager'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import type { Cache } from 'cache-manager'
import { expect } from 'chai'
import { CacheConfigService } from './cache-config.service'

describe('CacheConfigService', () => {
  let cacheManager: Cache
  let cacheConfigService: CacheConfigService

  let module: TestingModule

  before(async () => {
    const mockConfigService = {
      get: (key: string) => {
        if (key === 'REDIS_HOST') return 'localhost'
        if (key === 'REDIS_PORT') return '6380'
        return undefined
      }
    }

    module = await Test.createTestingModule({
      imports: [
        ConfigModule,
        CacheModule.registerAsync({
          useClass: CacheConfigService,
          imports: [ConfigModule]
        })
      ],
      providers: [
        CacheConfigService,
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    cacheManager = module.get<Cache>(CACHE_MANAGER)
    cacheConfigService = module.get<CacheConfigService>(CacheConfigService)
  })

  after(async () => {
    if (module) {
      module.close()
    }
  })

  describe('Redis Connection Test', () => {
    it('should persist data across multiple operations', async () => {
      const keys = ['key1', 'key2', 'key3']
      const values = ['value1', 'value2', 'value3']

      for (let i = 0; i < keys.length; i++) {
        await cacheManager.set(keys[i], values[i], 5000)
      }

      for (let i = 0; i < keys.length; i++) {
        const result = await cacheManager.get(keys[i])
        expect(result).to.equal(values[i])
      }
    })

    it('should handle TTL correctly', async () => {
      const testKey = 'ttl-test-key'
      const testValue = 'ttl-test-value'

      await cacheManager.set(testKey, testValue, 1000)

      let result = await cacheManager.get(testKey)
      expect(result).to.equal(testValue)

      await new Promise((resolve) => setTimeout(resolve, 1100))
      result = await cacheManager.get(testKey)
      expect(result).to.be.undefined
    })

    it('should verify store type is Redis-based', async () => {
      const options = await cacheConfigService.createCacheOptions()

      expect(options.stores).to.be.an('array')
      expect(options.stores).to.have.length(1)

      const store = options.stores![0].store
      expect(store).to.have.property('constructor')
      expect(store.constructor.name).to.equal('KeyvRedis')

      await store.disconnect()
    })
  })

  describe('Configuration Error Handling', async () => {
    it('should throw error when Redis host is missing', () => {
      const mockConfigService = {
        get: (key: string) => {
          if (key === 'REDIS_HOST') return undefined
          if (key === 'REDIS_PORT') return '6379'
          return undefined
        }
      }

      const cacheConfigService = new CacheConfigService(
        mockConfigService as ConfigService
      )

      expect(cacheConfigService.createCacheOptions()).to.be.rejectedWith(
        'Redis host and port must be configured'
      )
    })

    it('should throw error when Redis port is missing', () => {
      const mockConfigService = {
        get: (key: string) => {
          if (key === 'REDIS_HOST') return 'localhost'
          if (key === 'REDIS_PORT') return undefined
          return undefined
        }
      }

      const cacheConfigService = new CacheConfigService(
        mockConfigService as ConfigService
      )

      expect(cacheConfigService.createCacheOptions()).to.be.rejectedWith(
        'Redis host and port must be configured'
      )
    })
  })
})
