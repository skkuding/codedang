import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ContestModule } from '@client/contest/contest.module'
import { WorkbookModule } from '@client/workbook/workbook.module'
import { ContestProblemController } from './contest-problem.controller'
import { ProblemController } from './problem.controller'
import { ProblemRepository } from './problem.repository'
import {
  ContestProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'
import { WorkbookProblemController } from './workbook-problem.controller'

@Module({
  imports: [RolesModule, ContestModule, WorkbookModule],
  controllers: [
    ProblemController,
    ContestProblemController,
    WorkbookProblemController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    WorkbookProblemService,
    ProblemRepository
  ]
})
export class ProblemModule {}
