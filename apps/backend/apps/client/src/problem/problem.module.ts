import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { GroupMemberGuard, RolesModule } from '@libs/auth'
import { StorageModule } from '@libs/storage'
import { AssignmentModule } from '@client/assignment/assignment.module'
import { ContestModule } from '@client/contest/contest.module'
import { WorkbookModule } from '@client/workbook/workbook.module'
import {
  ContestProblemController,
  AssignmentProblemController,
  ProblemController
} from './problem.controller'
import {
  ContestProblemService,
  AssignmentProblemService,
  ProblemService,
  WorkbookProblemService
} from './problem.service'

@Module({
  imports: [
    RolesModule,
    ContestModule,
    AssignmentModule,
    WorkbookModule,
    StorageModule
  ],
  controllers: [
    ProblemController,
    ContestProblemController,
    AssignmentProblemController
  ],
  providers: [
    ProblemService,
    ContestProblemService,
    AssignmentProblemService,
    WorkbookProblemService,
    { provide: APP_GUARD, useClass: GroupMemberGuard }
  ]
})
export class ProblemModule {}
