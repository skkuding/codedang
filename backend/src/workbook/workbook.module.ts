import { Module } from '@nestjs/common'
import {
  GroupWorkbookController,
  PublicWorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'
import { WorkbookAdminController } from './workbook-admin.controller'
import { GroupService } from 'src/group/group.service'

@Module({
  imports: [UserModule],
  controllers: [
    PublicWorkbookController,
    GroupWorkbookController,
    WorkbookAdminController
  ],
  providers: [WorkbookService, GroupService]
})
export class WorkbookModule {}
