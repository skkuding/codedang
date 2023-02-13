import { Module } from '@nestjs/common'
import { ContestModule } from 'src/contest/contest.module'
import { GroupModule } from 'src/group/group.module'
import { UserModule } from 'src/user/user.module'
import { WorkbookModule } from 'src/workbook/workbook.module'
import { WorkbookService } from 'src/workbook/workbook.service'
import {
  GroupContestProblemController,
  GroupWorkbookProblemController,
  PublicContestProblemController,
  PublicProblemController,
  PublicWorkbookProblemController
} from './problem.controller'
import { ProblemRepository } from './problem.repository'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Module({
  imports: [GroupModule, UserModule, ContestModule, WorkbookModule],
  controllers: [
    PublicProblemController,
    PublicContestProblemController,
    PublicWorkbookProblemController,
    GroupContestProblemController,
    GroupWorkbookProblemController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    WorkbookProblemService,
    ProblemRepository,
    WorkbookService
  ]
})
export class ProblemModule {}
