import type {
  CacheModuleOptions,
  CacheOptionsFactory
} from '@nestjs/cache-manager'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import keyvRedis from '@keyv/redis'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    const host = this.config.get<string>('REDIS_HOST')
    const port = this.config.get<string>('REDIS_PORT')

    if (!host || !port) {
      throw new Error('Redis host and port must be configured')
    }

    return {
      store: new keyvRedis({
        socket: {
          host,
          port: parseInt(port)
        }
      })
    }
  }
}
