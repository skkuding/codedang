import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as redisStore from 'cache-manager-redis-store'

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly config: ConfigService) {}

  createCacheOptions(): CacheModuleOptions {
    return {
      store: redisStore,
      host: 'skkuding-dev-cache',
      port: 6379
    }
  }
}
