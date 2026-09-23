import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Controller, Get, HttpStatus, Inject, Res } from '@nestjs/common'
import type { Cache } from 'cache-manager'
import type { Response } from 'express'
import { AuthNotNeededIfPublic, UseDisableAdminGuard } from '@libs/auth'
import { PrismaService } from '@libs/prisma'
import { AdminService } from './admin.service'

@Controller()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  @Get()
  getHello() {
    return this.adminService.getHello()
  }

  @Get('health/ready')
  @AuthNotNeededIfPublic()
  @UseDisableAdminGuard()
  async getReadiness(@Res({ passthrough: true }) response: Response) {
    const checks = await Promise.allSettled([
      this.prisma.$queryRaw`SELECT 1`,
      this.cacheManager.get('__readiness__')
    ])

    if (checks.some(({ status }) => status === 'rejected')) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE)
      return { status: 'unavailable' }
    }

    return { status: 'ok' }
  }
}
