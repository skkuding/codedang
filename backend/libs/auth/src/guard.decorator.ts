import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import { Role } from '@prisma/client'
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
