import { Module } from '@nestjs/common'
import { ContestModule } from 'src/contest/contest.module'
import { GroupModule } from 'src/group/group.module'
import { UserModule } from 'src/user/user.module'
import { WorkbookModule } from 'src/workbook/workbook.module'
import {
  GroupContestProblemController,
  GroupWorkbookProblemController,
  ContestProblemController,
  ProblemController,
  WorkbookProblemController
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
    ProblemController,
    ContestProblemController,
    WorkbookProblemController,
    GroupContestProblemController,
    GroupWorkbookProblemController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    WorkbookProblemService,
    ProblemRepository
  ]
})
export class ProblemModule {}
