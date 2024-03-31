import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [RolesModule],
  controllers: [WorkbookController],
  providers: [
    WorkbookService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ],
  exports: [WorkbookService]
})
export class WorkbookModule {}
