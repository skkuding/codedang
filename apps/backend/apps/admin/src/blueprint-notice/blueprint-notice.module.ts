import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { BlueprintCourseModule } from '@admin/blueprint-course/blueprint-course.module'
import { BlueprintNoticeResolver } from './blueprint-notice.resolver'
import { BlueprintNoticeService } from './blueprint-notice.service'

@Module({
  // RolesModule: GroupLeaderGuard on unlinkBlueprintNotice uses RolesService.
  imports: [BlueprintCourseModule, RolesModule],
  providers: [BlueprintNoticeResolver, BlueprintNoticeService]
})
export class BlueprintNoticeModule {}
