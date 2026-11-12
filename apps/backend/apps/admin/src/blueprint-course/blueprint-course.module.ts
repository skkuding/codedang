import { Module } from '@nestjs/common'
import { BlueprintAccessService } from './blueprint-access.service'

@Module({
  providers: [BlueprintAccessService],
  exports: [BlueprintAccessService]
})
export class BlueprintCourseModule {}
