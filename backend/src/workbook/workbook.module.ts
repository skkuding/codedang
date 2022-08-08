import { Module } from '@nestjs/common'
import { WorkbookController } from './workbook.controller'
import { WorkbookService } from './workbook.service'

@Module({
  controllers: [WorkbookController],
  providers: [WorkbookService],
  exports: [WorkbookService]
})
export class WorkbookModule {}
