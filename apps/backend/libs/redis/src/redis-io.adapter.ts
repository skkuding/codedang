import type { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import type Redis from 'ioredis'
import type { ServerOptions } from 'socket.io'

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>

  constructor(
    app: INestApplicationContext,
    private readonly redisClient: Redis
  ) {
    super(app)
  }

  async connectToRedis() {
    const pubClient = this.redisClient
    const subClient = pubClient.duplicate()

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, options)
    server.adapter(this.adapterConstructor)
    return server
  }
}
