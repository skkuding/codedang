import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { CourseController, GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  imports: [RolesModule],
  controllers: [GroupController, CourseController],
  providers: [GroupService],
  exports: [GroupService]
})
export class GroupModule {}
