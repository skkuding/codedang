import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CourseController, GroupController } from './group.controller'
import { GroupService, CourseService } from './group.service'

@Module({
  imports: [RolesModule],
  controllers: [GroupController, CourseController],
  providers: [GroupService, CourseService],
  exports: [GroupService]
})
export class GroupModule {}
