import { Module } from '@nestjs/common'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'
import { GroupModule } from 'src/group/group.module'

@Module({
  imports: [UserModule, GroupModule],
  controllers: [WorkbookController],
  providers: [WorkbookService]
})
export class WorkbookModule {}
