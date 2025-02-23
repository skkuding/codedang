import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import type { ContestRole } from '@prisma/client'
import { CONTEST_ROLES_KEY } from './roles/contest-roles.decorator'
import { ContestRolesGuard } from './roles/contest-roles.guard'

export const AUTH_NOT_NEEDED_KEY = 'auth-not-needed'
export const AuthNotNeededIfOpenSpace = () =>
  SetMetadata('auth-not-needed', true)

export const USER_NULL_WHEN_AUTH_FAILED = 'user-null-when-auth-failed'
export const UserNullWhenAuthFailedIfOpenSpace = () =>
  SetMetadata(USER_NULL_WHEN_AUTH_FAILED, true)
export const LEADER_NOT_NEEDED_KEY = 'leader-not-needed'

export const ADMIN_NOT_NEEDED_KEY = 'admin-not-needed'
export const UseDisableAdminGuard = () => {
  return applyDecorators(SetMetadata(ADMIN_NOT_NEEDED_KEY, true))
}

export const UseContestRolesGuard = (role: ContestRole) => {
  return applyDecorators(
    SetMetadata(CONTEST_ROLES_KEY, role),
    SetMetadata(ADMIN_NOT_NEEDED_KEY, true),
    UseGuards(ContestRolesGuard)
  )
}
