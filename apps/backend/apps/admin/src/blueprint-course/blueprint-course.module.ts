import { Module } from '@nestjs/common'
import { BlueprintAccessService } from './blueprint-access.service'
import { BlueprintCourseResolver } from './blueprint-course.resolver'
import { BlueprintCourseService } from './blueprint-course.service'

@Module({
  providers: [
    BlueprintCourseResolver,
    BlueprintCourseService,
    BlueprintAccessService
  ],
  exports: [BlueprintAccessService]
})
export class BlueprintCourseModule {}
