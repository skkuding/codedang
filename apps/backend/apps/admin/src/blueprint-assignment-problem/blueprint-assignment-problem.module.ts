import { Module } from '@nestjs/common'
import { BlueprintAccessService } from '../blueprint-course/blueprint-access.service'
import { BlueprintAssignmentProblemResolver } from './blueprint-assignment-problem.resolver'
import { BlueprintAssignmentProblemService } from './blueprint-assignment-problem.service'

@Module({
  providers: [
    BlueprintAssignmentProblemResolver,
    BlueprintAssignmentProblemService,
    BlueprintAccessService
  ]
})
export class BlueprintAssignmentProblemModule {}
