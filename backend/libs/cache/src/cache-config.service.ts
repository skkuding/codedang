import type {
  CacheModuleOptions,
  CacheOptionsFactory
} from '@nestjs/cache-manager'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { redisStore } from 'cache-manager-redis-yet'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: await redisStore({
        socket: {
          host: this.config.get('REDIS_HOST'),
          port: this.config.get('REDIS_PORT')
        }
      })
    }
  }
}
