import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { AssignmentEventService } from './assignment-event.service'
import { AssignmentProblemResolver } from './assignment-problem.resolver'
import { AssignmentProblemService } from './assignment-problem.service'
import { AssignmentResolver } from './assignment.resolver'
import { AssignmentService } from './assignment.service'

@Module({
  imports: [RolesModule, ProblemModule],
  providers: [
    AssignmentService,
    AssignmentEventService,
    AssignmentResolver,
    AssignmentProblemResolver,
    AssignmentProblemService
  ],
  exports: [AssignmentService, AssignmentEventService]
})
export class AssignmentModule {}
