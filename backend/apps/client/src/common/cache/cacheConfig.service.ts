import { Injectable } from '@nestjs/common'
import type {
  CacheModuleOptions,
  CacheOptionsFactory
} from '@nestjs/cache-manager'
import { ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: await redisStore({
        socket: {
          host: this.config.get('CACHE_DATABASE_URL'),
          port: this.config.get('CACHE_DATABASE_PORT')
        }
      })
    }
  }
}
