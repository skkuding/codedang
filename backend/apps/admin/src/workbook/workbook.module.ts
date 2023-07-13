import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { WorkbookResolver } from './workbook.resolver'
import { WorkbookService } from './workbook.service'

@Module({
  imports: [RolesModule],
  providers: [WorkbookResolver, WorkbookService]
})
export class WorkbookModule {}
