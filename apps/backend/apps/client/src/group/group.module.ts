import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CourseController, GroupController } from './group.controller'
import { GroupService, CourseService } from './group.service'
import { StudyController } from './study.controller'
import { StudyService } from './study.service'

@Module({
  imports: [RolesModule],
  controllers: [GroupController, CourseController, StudyController],
  providers: [GroupService, CourseService, StudyService],
  exports: [GroupService]
})
export class GroupModule {}
