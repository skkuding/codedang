import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST')
        const port = config.get<number>('REDIS_PORT')
        const db = 1

        if (!host || !port) {
          throw new Error('Redis host and port must be configured')
        }

        const redis = new Redis({ port, host, db })

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
