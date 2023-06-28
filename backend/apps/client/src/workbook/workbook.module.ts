import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupModule } from '@client/group/group.module'
import { WorkbookAdminController } from './workbook-admin.controller'
import {
  GroupWorkbookController,
  WorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [RolesModule, GroupModule],
  controllers: [
    WorkbookController,
    GroupWorkbookController,
    WorkbookAdminController
  ],
  providers: [WorkbookService],
  exports: [WorkbookService]
})
export class WorkbookModule {}
