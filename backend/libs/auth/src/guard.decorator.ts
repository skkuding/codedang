import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import { Role } from '@prisma/client'
import { GroupMemberGuard } from './roles/group-member.guard'
import { ROLES_KEY } from './roles/roles.decorator'
import { RolesGuard } from './roles/roles.guard'

export const AUTH_NOT_NEEDED_KEY = 'auth-not-needed'
export const AuthNotNeededIfOpenSpace = () =>
  SetMetadata('auth-not-needed', true)

export const LEADER_NOT_NEEDED_KEY = 'leader-not-needed'
export const UseRolesGuard = (role: Role = Role.Admin) => {
  return applyDecorators(
    SetMetadata(LEADER_NOT_NEEDED_KEY, true),
    SetMetadata(ROLES_KEY, role),
    UseGuards(RolesGuard)
  )
}

// groupId가 URL query로 주어지는지 여부에 따라 주어지지 않는 경우 AuthNotNeeded가, 주어지는 경우 GroupMemberGuard가 작동됨
export const UseGroupMemberGuardOrNoAuth = () => {
  return applyDecorators(
    AuthNotNeededIfOpenSpace(),
    UseGuards(GroupMemberGuard)
  )
}
