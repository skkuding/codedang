import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  CourseNoticeResolver,
  GroupResolver,
  InvitationResolver,
  WhitelistResolver
} from './group.resolver'
import {
  CourseNoticeService,
  GroupService,
  InvitationService,
  WhitelistService
} from './group.service'

@Module({
  imports: [RolesModule],
  providers: [
    GroupResolver,
    GroupService,
    CourseNoticeResolver,
    CourseNoticeService,
    InvitationResolver,
    InvitationService,
    WhitelistResolver,
    WhitelistService
  ],
  exports: [
    GroupService,
    CourseNoticeService,
    InvitationService,
    WhitelistService
  ]
})
export class GroupModule {}
