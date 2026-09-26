import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import type { Cache } from 'cache-manager'
import { PrismaService } from '@libs/prisma'

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  getHello(): string {
    return 'Hello World!'
  }

  async isReady(): Promise<boolean> {
    const checks = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.cacheManager.get('__readiness__')
    ])

    return checks.every(({ status }) => status === 'fulfilled')
  }
}
