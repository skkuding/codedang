import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { MandeuldangPermissionService } from './mandeuldang-permission.service'
import { MandeuldangRolesGuard } from './mandeuldang-roles.guard'

@Module({
  imports: [PrismaModule],
  providers: [MandeuldangRolesGuard, MandeuldangPermissionService],
  exports: [MandeuldangRolesGuard, MandeuldangPermissionService]
})
export class MandeuldangAuthModule {}
