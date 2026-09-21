import { Controller, Get, Header } from '@nestjs/common'
import { ApiExcludeController } from '@nestjs/swagger'
import { AuthNotNeededIfPublic, UseDisableAdminGuard } from '@libs/auth'
import { PrismaService } from '@libs/prisma'

@ApiExcludeController()
@AuthNotNeededIfPublic()
@UseDisableAdminGuard()
@Controller()
export class InternalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('internal/prisma')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  getPrismaMetrics() {
    return this.prisma.$metrics.prometheus()
  }
}

@ApiExcludeController()
@Controller('api')
export class AdminInternalController extends InternalController {}
