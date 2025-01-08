import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { ProblemModule } from '@admin/problem/problem.module'
import { AssignmentResolver } from './assignment.resolver'
import { AssignmentService } from './assignment.service'

@Module({
  imports: [RolesModule, ProblemModule],
  providers: [AssignmentService, AssignmentResolver]
})
export class ContestModule {}
