import { Module } from '@nestjs/common'
import { WorkbookResolver } from './workbook.resolver'
import { WorkbookService } from './workbook.service'

@Module({
  providers: [WorkbookResolver, WorkbookService]
})
export class WorkbookModule {}
