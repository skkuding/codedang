import { Module } from '@nestjs/common'
import { RolesModule } from '@libs/auth'
import {
  GroupResolver,
  InvitationResolver,
  WhitelistResolver
} from './group.resolver'
import {
  GroupService,
  InvitationService,
  WhitelistService
} from './group.service'

@Module({
  imports: [RolesModule],
  providers: [
    GroupResolver,
    GroupService,
    InvitationResolver,
    InvitationService,
    WhitelistResolver,
    WhitelistService
  ],
  exports: [GroupService, InvitationService, WhitelistService]
})
export class GroupModule {}
