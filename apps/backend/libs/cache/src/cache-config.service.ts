import type {
  CacheModuleOptions,
  CacheOptionsFactory
} from '@nestjs/cache-manager'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createKeyv } from '@keyv/redis'
import type Keyv from 'keyv'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const host = this.config.get<string>('REDIS_HOST')
    const port = this.config.get<string>('REDIS_PORT')
    const db = 0

    if (!host || !port) {
      throw new Error('Redis host and port must be configured')
    }

    const store = createKeyv(`redis://${host}:${port}/${db}`, {
      throwOnErrors: true,
      throwOnConnectError: true
    })

    await this.testConnection(store)

    return {
      stores: [store]
    }
  }

  async testConnection(store: Keyv) {
    try {
      await store.set('test', 'connection')
      const value = await store.get('test')
      if (value === 'connection') {
        await store.delete('test')
      } else {
        throw new Error('unexpected value')
      }
    } catch (error) {
      throw new Error(`Redis connection failed: ${error.message}`)
    }
  }
}
