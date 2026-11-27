import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { AssignmentModule } from '@admin/assignment/assignment.module'
import { BlueprintCourseModule } from '@admin/blueprint-course/blueprint-course.module'
import { BlueprintAssignmentResolver } from './blueprint-assignment.resolver'
import { BlueprintAssignmentService } from './blueprint-assignment.service'

@Module({
  imports: [BlueprintCourseModule, AssignmentModule, RolesModule],
  providers: [BlueprintAssignmentResolver, BlueprintAssignmentService],
  exports: [BlueprintAssignmentService]
})
export class BlueprintAssignmentModule {}
