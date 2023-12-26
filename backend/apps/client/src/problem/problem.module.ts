import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestModule } from '@client/contest/contest.module'
import { WorkbookModule } from '@client/workbook/workbook.module'
import {
  ContestProblemController,
  GroupContestProblemController
} from './contest-problem.controller'
import { GroupProblemController, ProblemController } from './problem.controller'
import { ProblemRepository } from './problem.repository'
import {
  ContestProblemService,
  ProblemService,
  UserProblemService,
  WorkbookProblemService
} from './problem.service'
import { UserProblemController } from './user-problem.controller'
import {
  WorkbookProblemController,
  GroupWorkbookProblemController
} from './workbook-problem.controller'

@Module({
  imports: [RolesModule, ContestModule, WorkbookModule],
  controllers: [
    ProblemController,
    GroupProblemController,
    ContestProblemController,
    GroupContestProblemController,
    WorkbookProblemController,
    GroupWorkbookProblemController,
    UserProblemController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    WorkbookProblemService,
    UserProblemService,
    ProblemRepository
  ]
})
export class ProblemModule {}
