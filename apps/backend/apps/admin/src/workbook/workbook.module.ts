import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { WorkbookProblemResolver } from './workbook-problem.resolver'
import { WorkbookProblemService } from './workbook-problem.service'

@Module({
  imports: [RolesModule, ProblemModule],
  providers: [WorkbookProblemService, WorkbookProblemResolver]
})
export class WorkbookModule {}
