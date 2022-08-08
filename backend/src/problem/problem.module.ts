import { Module } from '@nestjs/common'
import { ContestModule } from 'src/contest/contest.module'
import { GroupModule } from 'src/group/group.module'
import { WorkbookModule } from 'src/workbook/workbook.module'
import {
  PublicProblemController,
  PublicContestProblemController,
  PublicWorkbookProblemController,
  GroupContestProblemController,
  GroupWorkbookProblemController
} from './problem.controller'
import { ProblemRepository } from './problem.repository'
import { ProblemService } from './problem.service'

@Module({
  imports: [GroupModule, ContestModule, WorkbookModule],
  controllers: [
    PublicProblemController,
    PublicContestProblemController,
    PublicWorkbookProblemController,
    GroupContestProblemController,
    GroupWorkbookProblemController
  ],
  providers: [ProblemService, ProblemRepository]
})
export class ProblemModule {}
