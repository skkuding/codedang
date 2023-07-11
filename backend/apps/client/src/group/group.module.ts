import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import { GroupController } from './group.controller'
import { GroupService } from './group.service'

@Module({
  imports: [RolesModule],
  controllers: [GroupController],
  providers: [GroupService],
  exports: [GroupService]
})
export class GroupModule {}
