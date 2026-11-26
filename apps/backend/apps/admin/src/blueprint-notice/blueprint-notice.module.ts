import { Module } from '@nestjs/common'
import { BlueprintCourseModule } from '@admin/blueprint-course/blueprint-course.module'
import { BlueprintNoticeResolver } from './blueprint-notice.resolver'
import { BlueprintNoticeService } from './blueprint-notice.service'

@Module({
  imports: [BlueprintCourseModule],
  providers: [BlueprintNoticeResolver, BlueprintNoticeService]
})
export class BlueprintNoticeModule {}
