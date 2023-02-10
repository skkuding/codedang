import { Module } from '@nestjs/common'
import {
  GroupWorkbookController,
  PublicWorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'
import { WorkbookAdminController } from './workbook-admin.controller'

@Module({
  imports: [UserModule],
  controllers: [
    PublicWorkbookController,
    GroupWorkbookController,
    WorkbookAdminController
  ],
  providers: [WorkbookService]
})
export class WorkbookModule {}
