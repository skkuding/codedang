// apps/backend/libs/redis/src/redis.module.ts
import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST')
        const port = configService.get<number>('REDIS_PORT')
        const password = configService.get<string>('REDIS_PASSWORD')
        const db = 1

        if (!host || !port) {
          throw new Error('Redis host and port must be configured')
        }

        const redis = new Redis({ host, port, password, db })

        try {
          const result = await redis.ping()
          if (result !== 'PONG') {
            throw new Error('Unexpected ping response')
          }
        } catch (error) {
          throw new Error(`Redis connection failed: ${error.message}`)
        }

        return redis
      },
      inject: [ConfigService]
    }
  ],
  exports: [REDIS_CLIENT]
})
export class RedisModule {}
