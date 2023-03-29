import { Module } from '@nestjs/common'
import {
  GroupWorkbookController,
  WorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'
import { GroupModule } from 'src/group/group.module'
import { WorkbookAdminController } from './workbook-admin.controller'

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
