import { Module } from '@nestjs/common'
import { WorkbookproblemResolver } from './workbookproblem.resolver'
import { WorkbookproblemService } from './workbookproblem.service'

@Module({
  providers: [WorkbookproblemResolver, WorkbookproblemService]
})
export class WorkbookproblemModule {}
