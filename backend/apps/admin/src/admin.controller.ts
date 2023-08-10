import { Controller, Get } from '@nestjs/common'
import { AdminService } from './admin.service'

@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getHello() {
    return this.adminService.getHello()
  }
}
