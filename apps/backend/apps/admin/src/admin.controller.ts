import { Controller, Get, HttpStatus, Res } from '@nestjs/common'
import type { Response } from 'express'
import { AuthNotNeededIfPublic, UseDisableAdminGuard } from '@libs/auth'
import { AdminService } from './admin.service'

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getHello() {
    return this.adminService.getHello()
  }

  @Get('health/ready')
  @AuthNotNeededIfPublic()
  @UseDisableAdminGuard()
  async getReadiness(@Res({ passthrough: true }) response: Response) {
    if (!(await this.adminService.isReady())) {
      response.status(HttpStatus.SERVICE_UNAVAILABLE)
      return { status: 'unavailable' }
    }

    return { status: 'ok' }
  }
}
