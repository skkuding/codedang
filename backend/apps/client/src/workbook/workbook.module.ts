import { Module } from '@nestjs/common'
import { GroupModule } from '@client/group/group.module'
import { UserModule } from '@client/user/user.module'
import { WorkbookAdminController } from './workbook-admin.controller'
import {
  GroupWorkbookController,
  WorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [UserModule, GroupModule],
  controllers: [
    WorkbookController,
    GroupWorkbookController,
    WorkbookAdminController
  ],
  providers: [WorkbookService],
  exports: [WorkbookService]
})
export class WorkbookModule {}
