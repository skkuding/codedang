import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { WorkbookAdminController } from './workbook-admin.controller'
import {
  GroupWorkbookController,
  WorkbookController
} from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [RolesModule],
  controllers: [
    WorkbookController,
    GroupWorkbookController,
    WorkbookAdminController
  ],
  providers: [WorkbookService],
  exports: [WorkbookService]
})
export class WorkbookModule {}
