import { Module } from '@nestjs/common'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'
import { UserModule } from 'src/user/user.module'

@Module({
  imports: [UserModule],
  controllers: [WorkbookController],
  providers: [WorkbookService]
})
export class WorkbookModule {}
