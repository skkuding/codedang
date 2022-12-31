import { Module } from '@nestjs/common'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'
import { GroupModule } from 'src/group/group.module'
import { WorkbookAdminController } from './workbook-admin.controller'

@Module({
  imports: [UserModule, GroupModule],
  controllers: [WorkbookController, WorkbookAdminController],
  providers: [WorkbookService]
})
export class WorkbookModule {}
