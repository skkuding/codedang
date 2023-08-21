import { Module } from '@nestjs/common'
import { WorkbookProblemResolver } from './workbook-problem.resolver'
import { WorkbookProblemService } from './workbook-problem.service'

@Module({
  providers: [WorkbookProblemResolver, WorkbookProblemService]
})
export class WorkbookProblemModule {}
