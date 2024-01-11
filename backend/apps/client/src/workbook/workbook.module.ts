import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [RolesModule],
  controllers: [WorkbookController],
  providers: [WorkbookService],
  exports: [WorkbookService]
})
export class WorkbookModule {}
