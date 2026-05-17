import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  CourseNoticeResolver,
  GroupResolver,
  InvitationResolver,
  WhitelistResolver,
  CourseResolver,
  GroupCommentResolver
} from './group.resolver'
import {
  CourseNoticeService,
  GroupService,
  InvitationService,
  WhitelistService,
  CourseService,
  GroupCommentService
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
    WhitelistService,
    CourseResolver,
    CourseService,
    GroupCommentResolver,
    GroupCommentService
  ],
  exports: [
    GroupService,
    CourseNoticeService,
    InvitationService,
    WhitelistService
  ]
})
export class GroupModule {}
