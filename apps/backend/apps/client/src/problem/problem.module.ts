import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { ContestModule } from '@client/contest/contest.module'
import { WorkbookModule } from '@client/workbook/workbook.module'
import { CodeDraftController } from './code-draft.controller'
import {
  ContestProblemController,
  ProblemController
} from './problem.controller'
import { ProblemRepository } from './problem.repository'
import {
  ContestProblemService,
  ProblemService,
  CodeDraftService,
  WorkbookProblemService
} from './problem.service'

@Module({
  imports: [RolesModule, ContestModule, WorkbookModule],
  controllers: [
    ProblemController,
    ContestProblemController,
    CodeDraftController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    WorkbookProblemService,
    CodeDraftService,
    ProblemRepository,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ],
  exports: [ProblemRepository]
})
export class ProblemModule {}
