import { Module } from '@nestjs/common'
import { PrismaModule } from '@libs/prisma'
import { MandeuldangRolesGuard } from './mandeuldang-roles.guard'

@Module({
  imports: [PrismaModule],
  providers: [MandeuldangRolesGuard],
  exports: [MandeuldangRolesGuard]
})
export class MandeuldangAuthModule {}
