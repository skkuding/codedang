import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { AssignmentModule } from '@client/assignment/assignment.module'
import { ContestModule } from '@client/contest/contest.module'
import { WorkbookModule } from '@client/workbook/workbook.module'
import { CodeDraftController } from './code-draft.controller'
import {
  ContestProblemController,
  AssignmentProblemController,
  ProblemController
} from './problem.controller'
import {
  ContestProblemService,
  AssignmentProblemService,
  ProblemService,
  CodeDraftService,
  WorkbookProblemService
} from './problem.service'

@Module({
  imports: [RolesModule, ContestModule, AssignmentModule, WorkbookModule],
  controllers: [
    ProblemController,
    ContestProblemController,
    AssignmentProblemController,
    CodeDraftController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    AssignmentProblemService,
    WorkbookProblemService,
    CodeDraftService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ]
})
export class ProblemModule {}
